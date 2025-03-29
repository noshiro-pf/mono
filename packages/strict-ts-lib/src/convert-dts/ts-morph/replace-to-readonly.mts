import { type ArrayTypeNode, type Node, SyntaxKind, type ts } from 'ts-morph';
import { type SourceFile } from './types.mjs';

export const replaceToReadonly = (sourceFile: SourceFile): void => {
  convertArrayGenericTypeToBeReadonly(sourceFile);
  convertSetAndMapToBeReadonly(sourceFile);
  convertTupleToBeReadonly(sourceFile);
  convertArrayToBeReadonly(sourceFile);
  convertInterfaceMemberToBeReadonly(sourceFile);
  convertIndexSignatureToBeReadonly(sourceFile);
  convertMappedTypeToBeReadonly(sourceFile);
  convertTypeReferenceToBeReadonly(sourceFile);
};

const convertArrayGenericTypeToBeReadonly = (sourceFile: SourceFile): void => {
  for (const node of sourceFile.getDescendantsOfKind(
    SyntaxKind.TypeReference,
  )) {
    // Array<T> to readonly T[]
    if (node.getTypeName().getText() === 'Array') {
      const typeArguments = node.getTypeArguments();
      if (typeArguments.length === 1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const elementType = typeArguments[0]!;
        node.replaceWithText(`(readonly ${elementType.getText()}[])`);
      }
    }
  }
};

const convertSetAndMapToBeReadonly = (sourceFile: SourceFile): void => {
  for (const node of sourceFile.getDescendantsOfKind(
    SyntaxKind.TypeReference,
  )) {
    const typeName = node.getTypeName().getText();
    // Set<T> to ReadonlySet<T>
    if (typeName === 'Set') {
      const typeArguments = node.getTypeArguments();
      if (typeArguments.length === 1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const elementType = typeArguments[0]!;
        node.replaceWithText(`ReadonlySet<${elementType.getText()}>`);
      }
    }

    // Map<T> to ReadonlyMap<T>
    if (typeName === 'Map') {
      const typeArguments = node.getTypeArguments();
      if (typeArguments.length === 2) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const keyType = typeArguments[0]!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const valueType = typeArguments[1]!;
        node.replaceWithText(
          `ReadonlyMap<${keyType.getText()}, ${valueType.getText()}>`,
        );
      }
    }
  }
};

const convertTupleToBeReadonly = (sourceFile: SourceFile): void => {
  for (const node of sourceFile.getDescendantsOfKind(SyntaxKind.TupleType)) {
    const parent = node.getParent();
    if (
      parent.isKind(SyntaxKind.TypeOperator) &&
      parent.getOperator() === SyntaxKind.ReadonlyKeyword
    ) {
      continue;
    }

    node.replaceWithText(`(readonly ${node.getText()})`);
  }
};

const convertArrayToBeReadonly = (sourceFile: SourceFile): void => {
  for (const arrayTypeNode of sourceFile.getDescendantsOfKind(
    SyntaxKind.ArrayType,
  )) {
    let mut_currentTypeNode: ArrayTypeNode = arrayTypeNode;
    let mut_depth = 0;

    while (true) {
      const n = mut_currentTypeNode.getElementTypeNode();

      if (n.isKind(SyntaxKind.ArrayType)) {
        mut_currentTypeNode = n;
        mut_depth += 1;
      } else {
        break;
      }
    }

    const innermostType: ts.TypeNode | undefined =
      mut_currentTypeNode.getElementTypeNode().compilerNode;

    console.log({
      innermostType,
      mut_depth,
    });

    const readonlyElementType: ts.TypeNode = innermostType;
    let mut_newArrayType = readonlyElementType;
    //     for (let i = 0; i < depth; i++) {
    //       mut_newArrayType = project.createNodeFromCompilerNode(factory.createArrayTypeNode(
    //         project.createNodeFromCompilerNode( factory.createTypeReferenceNode(
    //           factory.createIdentifier("readonly"),
    //           factory.createTypeParameterDeclaration([
    //             project.createNodeFromCompilerNode(factory.createArrayTypeNode( mut_newArrayType.compilerNode, undefined) as ts.TypeNode] )),
    //         ), undefined) as ts.TypeNode,
    //       ), undefined);
    //     }
    //     arrayTypeNode.replaceWithText(mut_newArrayType.getText());
  }
};

// const convertArrayToBeReadonly = (sourceFile: SourceFile): void => {
//   for (const [i, node] of sourceFile
//     .getDescendantsOfKind(SyntaxKind.ArrayType)
//     .entries()) {
//     const elementTypeNode = node.getChildAtIndex(0); // T in T[]
//     const parent = node.getParent();
//     if (
//       parent.isKind(SyntaxKind.TypeOperator) &&
//       parent.getOperator() === SyntaxKind.ReadonlyKeyword
//     ) {
//       continue;
//     }

//     node.replaceWithText(`(readonly ${elementTypeNode.getText()}[])`);
//     console.log(i, sourceFile.getText());
//   }
// };

const convertInterfaceMemberToBeReadonly = (sourceFile: SourceFile): void => {
  for (const node of sourceFile.getDescendantsOfKind(
    SyntaxKind.InterfaceDeclaration,
  )) {
    for (const member of node.getMembers()) {
      if (member.isKind(SyntaxKind.PropertySignature)) {
        const property = member;

        // すでに readonly が付いている場合はスキップ
        if (
          property
            .getModifiers()
            .some((modifier) => modifier.isKind(SyntaxKind.ReadonlyKeyword))
        ) {
          continue;
        }

        // readonly を追加
        property.setIsReadonly(true);
      }
    }
  }
};

const convertIndexSignatureToBeReadonly = (sourceFile: SourceFile): void => {
  for (const node of sourceFile.getDescendantsOfKind(
    SyntaxKind.IndexSignature,
  )) {
    if (
      node
        .getModifiers()
        .some((modifier) => modifier.isKind(SyntaxKind.ReadonlyKeyword))
    ) {
      continue;
    }
    node.setIsReadonly(true);
  }
};

const convertMappedTypeToBeReadonly = (sourceFile: SourceFile): void => {
  for (const node of sourceFile.getDescendantsOfKind(SyntaxKind.MappedType)) {
    const readonlyToken = node.getReadonlyToken() satisfies
      | Node<ts.ReadonlyKeyword>
      | Node<ts.PlusToken>
      | Node<ts.MinusToken>
      | undefined;
    if (readonlyToken === undefined) {
      node.replaceWithText(node.getText().replace(/^\{/u, '{ readonly '));
      continue;
    }
    switch (
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      readonlyToken.getKind() as
        | SyntaxKind.ReadonlyKeyword
        | SyntaxKind.PlusToken
        | SyntaxKind.MinusToken
    ) {
      case SyntaxKind.ReadonlyKeyword:
      case SyntaxKind.PlusToken:
        break;

      case SyntaxKind.MinusToken:
        node.replaceWithText(
          node.getText().replace(/^\{ -readonly/u, '{ readonly '),
        );
        break;
    }

    // node.replaceWithText();
    // if (node .isKind(ts.SyntaxKind.MappedType)) {

    //   ts.NodeFactory.createMappedTypeNode()
    //   node.readonly
    // }
    // node.getCombinedModifierFlags.setIsReadonly(true);
  }
};

const convertTypeReferenceToBeReadonly = (sourceFile: SourceFile): void => {
  for (const node of sourceFile.getDescendantsOfKind(
    SyntaxKind.TypeReference,
  )) {
    for (const args of node.getTypeArguments()) {
      if (args.isKind(SyntaxKind.TupleType)) {
        const parent = node.getParent();
        if (
          parent.isKind(SyntaxKind.TypeOperator) &&
          parent.getOperator() === SyntaxKind.ReadonlyKeyword
        ) {
          continue;
        }

        node.replaceWithText(`(readonly ${node.getText()})`);
      }

      if (args.isKind(SyntaxKind.ArrayType)) {
        const parent = node.getParent();
        if (
          parent.isKind(SyntaxKind.TypeOperator) &&
          parent.getOperator() === SyntaxKind.ReadonlyKeyword
        ) {
          continue;
        }

        const elementTypeNode = node.getChildAtIndex(0); // T in T[]

        node.replaceWithText(`(readonly ${elementTypeNode.getText()}[])`);
      }
    }
  }
};

// const nodeContainsDotDotDotToken = (node: Node): boolean => {
//   if (Node.isParameterDeclaration(node)) {
//     const parameter = node;
//     return parameter.getChildAtIndex(0).getKind() === SyntaxKind.DotDotDotToken;
//   }
//   return false;
// };

// {
//   // 2. { member: X } to Readonly<{ member: X }>
//   const typeLiterals = sourceFile.getDescendantsOfKind(
//     SyntaxKind.TypeLiteral,
//   );
//   for (const node of typeLiterals) {
//     // Check if it's not already wrapped in Readonly
//     if (
//       node.getParent()?.getKind() !== SyntaxKind.TypeReference ||
//       node.getParent()?.getTypeName()?.getText() !== 'Readonly'
//     ) {
//       node.replaceWithText(`Readonly<${node.getText()}>`);
//     }
//   }
// }
