import * as tsm from 'ts-morph';

export const isSpreadParameterNode = (
  node: tsm.Node,
): node is tsm.ParameterDeclaration =>
  node.isKind(tsm.SyntaxKind.Parameter) &&
  node.getDotDotDotToken() !== undefined;

export const isSpreadNamedTupleMemberNode = (
  node: tsm.Node,
): node is tsm.NamedTupleMember =>
  node.isKind(tsm.SyntaxKind.NamedTupleMember) &&
  node.getDotDotDotToken() !== undefined;
