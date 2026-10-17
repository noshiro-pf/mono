import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildNamedImportFix,
  getArgumentText,
  getImportDeclarations,
  getImportedLocalName,
  skipTypeWrappers,
  typeWrapperLayers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';
import { primitiveTypeFlags, TS_DATA_FORGE_MODULE } from './constants.mjs';
import { needsMutableResult } from './mutable-result.mjs';

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

    const tsDataForgeImports = getImportDeclarations(
      program,
      TS_DATA_FORGE_MODULE,
    );

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

      if (arrayExpression === undefined) {
        return;
      }

      if (!isGlobal(sourceCode, node, 'Set')) {
        return;
      }

      // At every layer of type wrappers (see typeWrapperLayers).
      const isPrimitiveArray = typeWrapperLayers(arrayExpression).every(
        (layer) => {
          const tsNode = getTsNode(layer);

          return (
            tsNode !== undefined &&
            isPrimitiveArrayType(checker, checker.getTypeAtLocation(tsNode))
          );
        },
      );

      if (!isPrimitiveArray) {
        return;
      }

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

        if (!isGlobal(sourceCode, node, 'Array')) {
          return;
        }

        check(node, node.arguments[0]);
      },
      ArrayExpression: (node) => {
        // [...new Set(xs)]
        if (!Arr.isFixedLengthTuple(1, node.elements)) {
          return;
        }

        const element = node.elements[0];

        if (element?.type !== AST_NODE_TYPES.SpreadElement) {
          return;
        }

        check(node, element.argument);
      },
      'Program:exit': () => {
        const arrLocalName = getImportedLocalName(tsDataForgeImports, 'Arr');

        const arrName = arrLocalName ?? 'Arr';

        // The import is added by the first fix only, so that several fixes do
        // not insert it at the same position. When the first match is not
        // autofixable, the first autofixable one carries it instead.
        const firstAutofixable = mut_matches.find((m) => m.autofixable);

        for (const match of mut_matches) {
          const arrayText = sourceCode.getText(match.arrayExpression);

          const argumentText = getArgumentText(
            sourceCode,
            match.arrayExpression,
          );

          const buildFix =
            (withImport: boolean): TSESLint.ReportFixFunction =>
            (fixer) => [
              ...(withImport && arrLocalName === undefined
                ? buildNamedImportFix(fixer, program, TS_DATA_FORGE_MODULE, [
                    'Arr',
                  ])
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

/**
 * Returns `xs` for `new Set(xs)`, and `undefined` for anything else — including
 * `new Set()`, `new Set<T>(xs)` (whose element type may be wider than `xs`'s)
 * and `new Set(...args)`.
 */
const getSetSourceArray = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  wrapped: TSESTree.Node,
): TSESTree.Expression | undefined => {
  // `new Set(xs) as ReadonlySet<string>` is still `new Set(xs)`.
  const node = skipTypeWrappers(wrapped);

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
  const variable = ASTUtils.findVariable(sourceCode.getScope(node), name);

  // Globals from the TypeScript lib are implicit variables with no definition.
  return variable === null || variable.defs.length === 0;
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

  return resolved.isUnion()
    ? resolved.types.every((t) => isPrimitiveType(checker, t))
    : (resolved.flags & primitiveTypeFlags) !== 0;
};

const resolveConstraint = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): ts.Type =>
  (type.flags & ts.TypeFlags.TypeParameter) !== 0
    ? (checker.getBaseConstraintOfType(type) ?? type)
    : type;
