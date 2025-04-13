import * as ts from 'ts-morph';

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
  if (!node.isKind(ts.SyntaxKind.AsExpression)) {
    return false;
  }

  // 2. Get the 'type' node from the AsExpression
  const typeNode = node.getTypeNode();
  if (typeNode === undefined) {
    return false; // Should have a type node for 'as const'
  }

  // 3. Check if the 'type' node is a TypeReference
  if (!typeNode.isKind(ts.SyntaxKind.TypeReference)) {
    return false;
  }

  // 4. Get the 'typeName' from the TypeReference
  const typeNameNode = typeNode.getTypeName();

  // 5. Check if the 'typeName' is an Identifier
  if (!typeNameNode.isKind(ts.SyntaxKind.Identifier)) {
    // 'as const' uses a simple Identifier 'const', not a QualifiedName
    return false;
  }

  // 6. Check if the Identifier's text is 'const'
  //    and that there are no type arguments (as const doesn't have them)
  return (
    typeNameNode.getText() === 'const' &&
    typeNode.getTypeArguments().length === 0
  );
};
