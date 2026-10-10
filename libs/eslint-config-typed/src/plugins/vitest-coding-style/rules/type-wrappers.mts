import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import type { DeepReadonly } from 'ts-type-forge';
import { isTypeWrapper } from '../../ast-utils/index.mjs';

/**
 * `node` with every `as`, `satisfies`, `!` and `<T>` around it taken off — the
 * expression whose value it is. The same as `skipTypeWrappers`, for the
 * mutable node types a fixer and the scope manager take.
 */
export const withoutTypeWrappers = (
  // Mutable because what it returns is handed to a fixer or the scope manager,
  // whose parameters are, as in `getVitestReceiver`.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): TSESTree.Expression =>
  isTypeWrapper(node) ? withoutTypeWrappers(node.expression) : node;

/**
 * Whether `node` is what a call calls, looking through the type wrappers
 * around it: `assert.deepEqual!(a, b)` and
 * `(assert.deepEqual satisfies unknown)(a, b)` call `assert.deepEqual`.
 */
export const isCalleeOfCall = (
  node: DeepReadonly<TSESTree.Expression>,
): boolean => {
  const { parent } = node;

  return isTypeWrapper(parent)
    ? isCalleeOfCall(parent)
    : parent.type === AST_NODE_TYPES.CallExpression && parent.callee === node;
};

/**
 * The text of `node` in `sourceText`, as one argument of a call. The text of a
 * node never includes the parentheses written around it, so a sequence
 * expression is parenthesized here whether or not the source had them:
 * `(setup(), x)` would otherwise become two arguments.
 */
export const argumentText = (
  sourceText: string,
  node: DeepReadonly<TSESTree.Node>,
): string => {
  const text = sourceText.slice(node.range[0], node.range[1]);

  return node.type === AST_NODE_TYPES.SequenceExpression ? `(${text})` : text;
};
