import { type Node, SyntaxKind, type ts } from 'ts-morph';
import { type SourceFile } from './types.mjs';

export const replaceToReadonly = (sourceFile: SourceFile): void => {
  convertTupleToBeReadonly(sourceFile);
  convertArrayToBeReadonly(sourceFile);
  convertInterfaceMemberToBeReadonly(sourceFile);
  convertIndexSignatureToBeReadonly(sourceFile);
  convertMappedTypeToBeReadonly(sourceFile);
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
  for (const node of sourceFile.getDescendantsOfKind(SyntaxKind.ArrayType)) {
    const elementTypeNode = node.getChildAtIndex(0); // T in T[]
    const parent = node.getParent();
    if (
      parent.isKind(SyntaxKind.TypeOperator) &&
      parent.getOperator() === SyntaxKind.ReadonlyKeyword
    ) {
      continue;
    }

    node.replaceWithText(`(readonly ${elementTypeNode.getText()}[])`);
  }
};

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
