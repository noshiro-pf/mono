import * as ts from 'typescript';

export const isSpreadParameterNode = (
  node: ts.Node,
): node is PartiallyRequired<ts.ParameterDeclaration, 'dotDotDotToken'> =>
  ts.isParameter(node) && node.dotDotDotToken !== undefined;

export const isSpreadNamedTupleMemberNode = (
  node: ts.Node,
): node is PartiallyRequired<ts.NamedTupleMember, 'dotDotDotToken'> =>
  ts.isNamedTupleMember(node) && node.dotDotDotToken !== undefined;
