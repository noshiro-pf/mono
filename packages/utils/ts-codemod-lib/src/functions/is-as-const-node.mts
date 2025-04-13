import * as ts from 'typescript';

export const isAsConstNode = (
  node: ts.Node,
): node is ts.AsExpression &
  Readonly<{
    type: ts.TypeReferenceNode &
      Readonly<{
        typeName: ts.Identifier &
          Readonly<{
            text: 'const';
          }>;
        typeArguments: undefined;
      }>;
  }> => {
  if (ts.isAsExpression(node) && ts.isTypeReferenceNode(node.type)) {
    const typeName = node.type.typeName;

    if (
      typeName.kind === ts.SyntaxKind.Identifier &&
      typeName.text === 'const'
    ) {
      return true;
    }
  }

  return false;
};
