import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';
import {
  buildImportFixes,
  getImportedLocalName,
  getTsDataForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useArrUniq' | 'suggestArrUniq';

/**
 * `Arr.uniq(xs)` is implemented as `Array.from(new Set(xs))`, so the rewrite
 * does not change behavior. What it does change is the static type: `Arr.uniq`
 * only accepts `readonly Primitive[]` and returns a readonly array. The rule
 * therefore reports only when the argument is an array or tuple of primitives,
 * and it applies the fix automatically only when nothing in sight needs the
 * result to be a mutable array; otherwise the rewrite is offered as a
 * suggestion.
 */
export const preferArrUniq: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `Array.from(new Set(xs))` / `[...new Set(xs)]` with `Arr.uniq(xs)` from ts-data-forge.',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      useArrUniq: 'Replace with `Arr.uniq({{arrayName}})` from ts-data-forge.',
      suggestArrUniq:
        'Replace with `Arr.uniq({{arrayName}})` from ts-data-forge (the result becomes a readonly array).',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImport = getTsDataForgeImport(program);

    const services = sourceCode.parserServices;

    const checker = services?.program?.getTypeChecker();

    const esTreeNodeToTSNodeMap = services?.esTreeNodeToTSNodeMap;

    // Without type information the rule cannot tell an array of primitives
    // from an array of objects, and would suggest code that does not compile.
    if (checker === undefined || esTreeNodeToTSNodeMap === undefined) {
      return {};
    }

    const getTsNode = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.Node,
    ): ts.Node | undefined => esTreeNodeToTSNodeMap.get(node);

    const mut_matches: {
      node: TSESTree.CallExpression | TSESTree.ArrayExpression;
      arrayExpression: TSESTree.Expression;
      autofixable: boolean;
    }[] = [];

    const check = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.CallExpression | TSESTree.ArrayExpression,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      setNode: TSESTree.Node,
    ): void => {
      const arrayExpression = getSetSourceArray(setNode);

      if (arrayExpression === undefined) return;

      if (!isGlobal(sourceCode, node, 'Set')) return;

      const arrayTsNode = getTsNode(arrayExpression);

      if (arrayTsNode === undefined) return;

      if (
        !isPrimitiveArrayType(checker, checker.getTypeAtLocation(arrayTsNode))
      )
        return;

      mut_matches.push({
        node,
        arrayExpression,
        autofixable: !needsMutableResult(sourceCode, checker, getTsNode, node),
      });
    };

    return {
      CallExpression: (node) => {
        // Array.from(new Set(xs))
        if (
          node.optional ||
          node.callee.type !== AST_NODE_TYPES.MemberExpression ||
          node.callee.computed ||
          node.callee.optional ||
          node.callee.object.type !== AST_NODE_TYPES.Identifier ||
          node.callee.object.name !== 'Array' ||
          node.callee.property.type !== AST_NODE_TYPES.Identifier ||
          node.callee.property.name !== 'from' ||
          // `Array.from(set, fn)` maps as well, which `Arr.uniq` does not.
          !Arr.isFixedLengthTuple(1, node.arguments)
        ) {
          return;
        }

        if (!isGlobal(sourceCode, node, 'Array')) return;

        check(node, node.arguments[0]);
      },
      ArrayExpression: (node) => {
        // [...new Set(xs)]
        if (!Arr.isFixedLengthTuple(1, node.elements)) return;

        const element = node.elements[0];

        if (element?.type !== AST_NODE_TYPES.SpreadElement) return;

        check(node, element.argument);
      },
      'Program:exit': () => {
        const arrLocalName = getImportedLocalName(tsDataForgeImport, 'Arr');

        const arrName = arrLocalName ?? 'Arr';

        // The import is added by the first fix only, so that several fixes do
        // not insert it at the same position. When the first match is not
        // autofixable, the first autofixable one carries it instead.
        const firstAutofixable = mut_matches.find((m) => m.autofixable);

        for (const match of mut_matches) {
          const arrayText = sourceCode.getText(match.arrayExpression);

          const argumentText =
            match.arrayExpression.type === AST_NODE_TYPES.SequenceExpression
              ? `(${arrayText})`
              : arrayText;

          const buildFix =
            (withImport: boolean): TSESLint.ReportFixFunction =>
            (fixer) => [
              ...(withImport && arrLocalName === undefined
                ? buildImportFixes(fixer, program, tsDataForgeImport, ['Arr'])
                : []),
              fixer.replaceText(match.node, `${arrName}.uniq(${argumentText})`),
            ];

          const data = { arrayName: arrayText } as const;

          if (match.autofixable) {
            context.report({
              node: match.node,
              messageId: 'useArrUniq',
              data,
              fix: buildFix(match === firstAutofixable),
            });
          } else {
            context.report({
              node: match.node,
              messageId: 'useArrUniq',
              data,
              suggest: [
                {
                  messageId: 'suggestArrUniq',
                  data,
                  fix: buildFix(true),
                },
              ],
            });
          }
        }
      },
    };
  },
  defaultOptions: [],
} as const;

/** Methods that `ReadonlyArray` lacks and that mutate the receiver. */
const mutatingMethods: ReadonlySet<string> = new Set([
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
]);

/**
 * Returns `xs` for `new Set(xs)`, and `undefined` for anything else — including
 * `new Set()`, `new Set<T>(xs)` (whose element type may be wider than `xs`'s)
 * and `new Set(...args)`.
 */
const getSetSourceArray = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): TSESTree.Expression | undefined => {
  if (
    node.type !== AST_NODE_TYPES.NewExpression ||
    node.callee.type !== AST_NODE_TYPES.Identifier ||
    node.callee.name !== 'Set' ||
    node.typeArguments !== undefined ||
    !Arr.isFixedLengthTuple(1, node.arguments)
  ) {
    return undefined;
  }

  const argument = node.arguments[0];

  return argument.type === AST_NODE_TYPES.SpreadElement ? undefined : argument;
};

/** Whether `name` at `node` refers to the built-in global, not a local binding. */
const isGlobal = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  name: string,
): boolean => {
  const variable = findVariable(sourceCode.getScope(node), name);

  // Globals from the TypeScript lib are implicit variables with no definition.
  return variable === undefined || variable.defs.length === 0;
};

const findVariable = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  scope: TSESLint.Scope.Scope,
  name: string,
): TSESLint.Scope.Variable | undefined => {
  const variable = scope.set.get(name);

  if (variable !== undefined) return variable;

  if (scope.upper === null) return undefined;

  return findVariable(scope.upper, name);
};

/**
 * Whether `type` is an array or tuple (or a union or intersection of them) whose elements are
 * all primitives, i.e. something `Arr.uniq` accepts.
 */
const isPrimitiveArrayType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): boolean => {
  const resolved = resolveConstraint(checker, type);

  if (resolved.isUnion()) {
    return resolved.types.every((t) => isPrimitiveArrayType(checker, t));
  }

  // `readonly string[] & Brand`, `readonly [...Ar, V] & NonEmptyArray<E>`: one
  // primitive-array member already makes the whole assignable to one.
  if (resolved.isIntersection()) {
    return resolved.types.some((t) => isPrimitiveArrayType(checker, t));
  }

  if (!checker.isArrayType(resolved) && !checker.isTupleType(resolved)) {
    return false;
  }

  const typeArguments = checker.getTypeArguments(
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    resolved as ts.TypeReference,
  );

  // An empty tuple has nothing to deduplicate, but is still accepted.
  return typeArguments.every((t) => isPrimitiveType(checker, t));
};

const isPrimitiveType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): boolean => {
  const resolved = resolveConstraint(checker, type);

  if (resolved.isUnion()) {
    return resolved.types.every((t) => isPrimitiveType(checker, t));
  }

  return (resolved.flags & primitiveTypeFlags) !== 0;
};

const primitiveTypeFlags =
  ts.TypeFlags.StringLike |
  ts.TypeFlags.NumberLike |
  ts.TypeFlags.BigIntLike |
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.ESSymbolLike |
  ts.TypeFlags.Null |
  ts.TypeFlags.Undefined;

const resolveConstraint = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): ts.Type =>
  (type.flags & ts.TypeFlags.TypeParameter) !== 0
    ? (checker.getBaseConstraintOfType(type) ?? type)
    : type;

/**
 * Whether the code around `node` visibly relies on the result being a mutable
 * array, so that swapping in the readonly array `Arr.uniq` returns would not
 * compile. Looks at `node` itself and, when it initializes a variable without a
 * type annotation, at every read of that variable.
 */
const needsMutableResult = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  getTsNode: (esNode: TSESTree.Node) => ts.Node | undefined,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean => {
  if (isUsedAsMutable(checker, getTsNode, node)) return true;

  const parent = node.parent;

  if (
    parent?.type !== AST_NODE_TYPES.VariableDeclarator ||
    parent.init !== node ||
    parent.id.type !== AST_NODE_TYPES.Identifier ||
    parent.id.typeAnnotation !== undefined
  ) {
    return false;
  }

  const [variable] = sourceCode.getDeclaredVariables(parent);

  return (
    variable?.references.some(
      (reference) =>
        reference.init !== true &&
        isUsedAsMutable(checker, getTsNode, reference.identifier),
    ) ?? false
  );
};

const isUsedAsMutable = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  getTsNode: (esNode: TSESTree.Node) => ts.Node | undefined,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean => {
  const parent = node.parent;

  if (
    parent?.type === AST_NODE_TYPES.MemberExpression &&
    parent.object === node
  ) {
    // xs.push(...), xs.sort(), ...
    if (
      !parent.computed &&
      parent.property.type === AST_NODE_TYPES.Identifier &&
      mutatingMethods.has(parent.property.name)
    ) {
      return true;
    }

    // xs[0] = ..., xs.length = ..., xs[0]++, delete xs[0]
    const grandParent = parent.parent;

    return (
      (grandParent.type === AST_NODE_TYPES.AssignmentExpression &&
        grandParent.left === parent) ||
      grandParent.type === AST_NODE_TYPES.UpdateExpression ||
      (grandParent.type === AST_NODE_TYPES.UnaryExpression &&
        grandParent.operator === 'delete')
    );
  }

  // Passed to a parameter, assigned to a variable, or returned from a function
  // whose declared type is a mutable array.
  const tsNode = getTsNode(node);

  if (tsNode === undefined) return false;

  if (!ts.isExpression(tsNode)) return false;

  const expectedType =
    getDeclaredParameterType(checker, tsNode) ??
    checker.getContextualType(tsNode);

  return (
    expectedType !== undefined && isMutableArrayOnly(checker, expectedType)
  );
};

/**
 * The declared type of the parameter `argument` is passed to. The contextual
 * type of an argument to a generic function is instantiated from that very
 * argument — `Arr.toSorted(Array.from(set), cmp)` has `Ar` inferred as
 * `string[]` — so it would read as "a mutable array is required" for any
 * generic parameter. The declared type (`Ar extends readonly unknown[]`) is
 * what the rewritten argument actually has to satisfy.
 */
const getDeclaredParameterType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  argument: ts.Expression,
): ts.Type | undefined => {
  const call = argument.parent;

  if (!ts.isCallExpression(call) && !ts.isNewExpression(call)) {
    return undefined;
  }

  const index = call.arguments?.indexOf(argument) ?? -1;

  if (index === -1) return undefined;

  const declaration = checker.getResolvedSignature(call)?.getDeclaration();

  const parameter = declaration?.parameters[index];

  // A rest parameter's declared type is the array of arguments, not the type of
  // one; the contextual type is the better answer there.
  if (parameter === undefined || parameter.dotDotDotToken !== undefined) {
    return undefined;
  }

  return checker.getTypeAtLocation(parameter);
};

/**
 * Whether a readonly array cannot be assigned to `type`: it is a mutable array,
 * or a union of mutable arrays and primitives. (A tuple accepted no array to
 * begin with, so it does not matter here.)
 */
const isMutableArrayOnly = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): boolean => {
  const members = type.isUnion() ? type.types : ([type] as const);

  return (
    members.every(
      (t) =>
        // `null`, `undefined` and other primitives accept no array at all.
        (t.flags & primitiveTypeFlags) !== 0 ||
        (checker.isArrayType(t) && t.getSymbol()?.getName() === 'Array'),
    ) && members.some((t) => (t.flags & primitiveTypeFlags) === 0)
  );
};
