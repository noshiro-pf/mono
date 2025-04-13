import * as tsm from 'ts-morph';

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export const removeParentheses = (node: tsm.TypeNode): tsm.TypeNode =>
  node.isKind(tsm.SyntaxKind.ParenthesizedType)
    ? removeParentheses(node.getTypeNode())
    : node;
