import type { TSESTree } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { isTypeWrapper } from '../../ast-utils/index.mjs';

/**
 * `node` with every `as`, `satisfies`, `!` and `<T>` around it taken off — the
 * expression whose value it is. The same as `skipTypeWrappers`, for the
 * mutable node types the parser services and the checker take.
 */
export const withoutTypeWrappers = (
  node: TSESTree.Expression,
): TSESTree.Expression =>
  isTypeWrapper(node) ? withoutTypeWrappers(node.expression) : node;

/**
 * `node` and every expression inside the type wrappers around it, outermost
 * first, ending with `withoutTypeWrappers(node)`. A rule that bans a partial
 * operation reports when the type at any of them says the operation may be the
 * partial one: the innermost is the value's own type, and an outer one is what
 * the author asserted it to be.
 */
export const typeWrapperLayers = (
  node: TSESTree.Expression,
): readonly TSESTree.Expression[] =>
  isTypeWrapper(node)
    ? Arr.toUnshifted(node)(typeWrapperLayers(node.expression))
    : ([node] as const);
