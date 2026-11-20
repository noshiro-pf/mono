import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type { DeepReadonly, RelaxedExtract } from 'ts-type-forge';
import type * as ts from 'typescript';

/**
 * The four expressions that change a value's type and nothing else: `x as T`,
 * `x!`, `x satisfies T` and `<T>x`.
 */
export type TypeWrapper =
  | TSESTree.TSAsExpression
  | TSESTree.TSNonNullExpression
  | TSESTree.TSSatisfiesExpression
  | TSESTree.TSTypeAssertion;

/**
 * The expression a type wrapper among `N` wraps, as mutable or as readonly as
 * `N` itself: `TSESTree.Expression` for a mutable node,
 * `DeepReadonly<TSESTree.Expression>` for a readonly one, and `never` when no
 * member of `N` is a type wrapper.
 */
export type WrappedExpression<N> = RelaxedExtract<
  N,
  DeepReadonly<TypeWrapper> | TypeWrapper
>['expression'];

/**
 * Whether `node` is a type wrapper (see {@link TypeWrapper}). Takes a readonly
 * or a mutable node and narrows it without changing which.
 */
export const isTypeWrapper = (
  node: DeepReadonly<TSESTree.Node>,
): node is DeepReadonly<TypeWrapper> | TypeWrapper =>
  TYPE_WRAPPERS.has(node.type);

/**
 * `node` with every `as`, `satisfies`, `!` and `<T>` around it taken off: the
 * expression whose value it is. A wrapper changes no value, so a rule judges
 * syntax on what this returns — `xs.length > (0 as number)` compares with the
 * literal `0`, and `(Number satisfies NumberConstructor)('1')` calls `Number` —
 * and writes its fix from the original node, so that the wrapper is kept. A
 * type is another matter: see {@link typeWrapperLayers}.
 */
export const skipTypeWrappers = <N extends DeepReadonly<TSESTree.Node>>(
  node: N,
): N | WrappedExpression<N> =>
  isTypeWrapper(node) ? skipTypeWrappers(node.expression) : node;

/**
 * `node` with every `as`, `satisfies`, `!` and `<T>` that wraps it: the
 * expression whose value is `node`'s, where it ends up — a call's argument, a
 * member's object, a variable's initializer. The counterpart of
 * {@link skipTypeWrappers}, which goes the other way. A type annotation is no
 * wrapper's value: a node that is one comes back as it is.
 */
export const outermostTypeWrapper = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> => {
  const { parent } = node;

  return parent !== undefined &&
    isTypeWrapper(parent) &&
    parent.expression === node
    ? outermostTypeWrapper(parent)
    : node;
};

/**
 * Whether `node` is what a call calls, through the type wrappers and an
 * optional chain around it: `f!()`, `(f as F)()`, `(o?.f)()` and `o?.f()` all
 * call `f` or `o?.f`. A `new` or a tag is no call.
 */
export const isCallee = (node: DeepReadonly<TSESTree.Node>): boolean => {
  const { parent } = node;

  if (parent === undefined) {
    return false;
  }

  if (isTypeWrapper(parent) || parent.type === AST_NODE_TYPES.ChainExpression) {
    return parent.expression === node && isCallee(parent);
  }

  return (
    parent.type === AST_NODE_TYPES.CallExpression && parent.callee === node
  );
};

/**
 * `node` and every expression inside the type wrappers around it, outermost
 * first: `x as A as B` gives `x as A as B`, `x as A` and `x`, the last of which
 * is `skipTypeWrappers(node)`.
 *
 * A conclusion a rule draws from a type — that a guard always holds, that a
 * value is an array, that an operation may throw — has to hold for the type of
 * every layer. An assertion therefore only ever makes a rule more cautious:
 * one that widens (`x as string | null`) is the author saying the value may be
 * `null`, and is respected; one that narrows (`x!`, `v as string` on an
 * `unknown`) is a claim the checker cannot verify, and the value's own type
 * still decides. The fix, which keeps the wrapper, has to type-check at every
 * layer too.
 */
export const typeWrapperLayers = <N extends DeepReadonly<TSESTree.Node>>(
  node: N,
): readonly (N | WrappedExpression<N>)[] =>
  isTypeWrapper(node)
    ? ([node, ...typeWrapperLayers(node.expression)] as const)
    : ([node] as const);

/**
 * Whether `node`, read through its type wrappers, is the identifier `name`:
 * `Number`, `(Number as NumberConstructor)` and `Number!` are the same object.
 */
export const isIdentifierNamed = (
  node: DeepReadonly<TSESTree.Node>,
  name: string,
): boolean => {
  const unwrapped = skipTypeWrappers(node);

  return (
    unwrapped.type === AST_NODE_TYPES.Identifier && unwrapped.name === name
  );
};

/**
 * Whether `holds` is true of the type of every layer of type wrappers around
 * `node` (see {@link typeWrapperLayers}), outermost to innermost; `false`
 * without type information. A widening cast (`s as string | number`) is the
 * author saying the value may be more than it is, and is respected; a narrowing
 * one (`s!`, `v as unknown as string`) cannot vouch for what the value's own
 * type does not, and the fix, which keeps the wrapper, has to
 * type-check at every layer too.
 */
export const typeHoldsAtEveryLayer = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  holds: (type: ts.Type, typeChecker: ts.TypeChecker) => boolean,
): boolean => typeHoldsAtLayers(sourceCode, node, holds, 'every');

/**
 * Whether `holds` is true of the type of some layer of type wrappers around
 * `node` (see {@link typeWrapperLayers}); `false` without type information. A
 * cast changes the type and not the value, so this is how to ask what the value
 * may be: `b as unknown as number` is still a bigint, and `n!` may still be
 * `undefined`. The counterpart of {@link typeHoldsAtEveryLayer}.
 */
export const typeHoldsAtSomeLayer = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  holds: (type: ts.Type, typeChecker: ts.TypeChecker) => boolean,
): boolean => typeHoldsAtLayers(sourceCode, node, holds, 'some');

const typeHoldsAtLayers = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  holds: (type: ts.Type, typeChecker: ts.TypeChecker) => boolean,
  quantifier: 'every' | 'some',
): boolean => {
  const services = sourceCode.parserServices;

  const checker = services?.program?.getTypeChecker();

  if (checker === undefined) {
    return false;
  }

  const holdsAt = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    layer: TSESTree.Node,
  ): boolean => {
    const tsNode = services?.esTreeNodeToTSNodeMap?.get(layer);

    return (
      tsNode !== undefined && holds(checker.getTypeAtLocation(tsNode), checker)
    );
  };

  const layers = typeWrapperLayers(node);

  return quantifier === 'every' ? layers.every(holdsAt) : layers.some(holdsAt);
};

const TYPE_WRAPPERS: ReadonlySet<AST_NODE_TYPES> = new Set<AST_NODE_TYPES>([
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSNonNullExpression,
  AST_NODE_TYPES.TSSatisfiesExpression,
  AST_NODE_TYPES.TSTypeAssertion,
]);
