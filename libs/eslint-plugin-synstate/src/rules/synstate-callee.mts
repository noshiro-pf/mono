import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  hasForeignBinding,
  isTypeWrapper,
  skipTypeWrappers,
  type ResolvedCallee,
} from 'eslint-rule-forge';
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

/**
 * What a fix writes in place of the callee of `node` — or in place of the
 * property, for a namespace import — to call synstate's export `exportName`
 * instead, given the name the file imports it under, if it does. `undefined`
 * when it cannot: the callee is in a type wrapper written for the type of
 * the export it calls, or the name would be something that is not
 * synstate's at the call.
 */
export const replacementCallee = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  resolved: ResolvedCallee,
  exportName: string,
  importedName: string | undefined,
): string | undefined => {
  if (resolved.isNamespace) {
    return exportName;
  }

  if (isTypeWrapper(node.callee)) {
    return undefined;
  }

  const name = importedName ?? exportName;

  return hasForeignBinding(sourceCode, node, name, SYNSTATE_MODULE)
    ? undefined
    : name;
};
