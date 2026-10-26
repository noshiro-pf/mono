import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { hasForeignBinding, skipTypeWrappers } from 'eslint-rule-forge';
import { SYNSTATE_MODULE } from './constants.mjs';

/**
 * Whether the identifier that decides what `callee` calls — the callee, or
 * the namespace object — is bound by something other than the synstate
 * import where it is read.
 */
export const isShadowedCallee = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callee: TSESTree.Expression,
): boolean => {
  const unwrapped = skipTypeWrappers(callee);

  const bound =
    unwrapped.type === AST_NODE_TYPES.MemberExpression
      ? skipTypeWrappers(unwrapped.object)
      : unwrapped;

  return (
    bound.type !== AST_NODE_TYPES.Identifier ||
    hasForeignBinding(sourceCode, bound, bound.name, SYNSTATE_MODULE)
  );
};
