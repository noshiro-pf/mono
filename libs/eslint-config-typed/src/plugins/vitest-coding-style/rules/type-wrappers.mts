import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { isTypeWrapper } from 'eslint-rule-forge';
import type { DeepReadonly } from 'ts-type-forge';

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
