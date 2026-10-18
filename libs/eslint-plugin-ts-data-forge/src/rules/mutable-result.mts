import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import * as ts from 'typescript';
import { primitiveTypeFlags } from './constants.mjs';

/**
 * Whether the code around `node` visibly relies on the result being a mutable
 * array, so that swapping in the readonly array `Arr.uniq` or `Arr.generate`
 * returns would not compile. Looks at `node` itself and, when it initializes a variable without a
 * type annotation, at every read of that variable.
 */
export const needsMutableResult = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  getTsNode: (esNode: TSESTree.Node) => ts.Node | undefined,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean => {
  const outer = outermostTypePreservingWrapper(node);

  if (isUsedAsMutable(checker, getTsNode, outer)) {
    return true;
  }

  const parent = outer.parent;

  if (
    parent?.type !== AST_NODE_TYPES.VariableDeclarator ||
    parent.init !== outer ||
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
        isUsedAsMutable(
          checker,
          getTsNode,
          outermostTypePreservingWrapper(reference.identifier),
        ),
    ) ?? false
  );
};

/**
 * `node`, or the outermost `!` / `satisfies` around it. Neither changes the
 * type the value is used at, so `Array.from(new Set(xs))!.push(4)` and
 * `ys!.push(4)` still need a mutable array. An `as` does change it, and a
 * readonly array may be cast to a mutable one, so the walk stops there.
 */
const outermostTypePreservingWrapper = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): TSESTree.Node => {
  const { parent } = node;

  return parent !== undefined &&
    (parent.type === AST_NODE_TYPES.TSNonNullExpression ||
      parent.type === AST_NODE_TYPES.TSSatisfiesExpression) &&
    parent.expression === node
    ? outermostTypePreservingWrapper(parent)
    : node;
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

  if (tsNode === undefined) {
    return false;
  }

  if (!ts.isExpression(tsNode)) {
    return false;
  }

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

  if (index === -1) {
    return undefined;
  }

  const declaration = checker.getResolvedSignature(call)?.getDeclaration();

  const parameter = declaration?.parameters[index];

  // A rest parameter's declared type is the array of arguments, not the type of
  // one; the contextual type is the better answer there.
  return parameter === undefined || parameter.dotDotDotToken !== undefined
    ? undefined
    : checker.getTypeAtLocation(parameter);
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
