import { type ReadonlyTypeReferenceNode } from './is-readonly-node.mjs';
import { wrapWithParentheses } from './wrap-with-parentheses.mjs';

export const unwrapReadonlyTypeArgText = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: ReadonlyTypeReferenceNode,
): string => wrapWithParentheses(node.getTypeArguments()[0].getFullText());
