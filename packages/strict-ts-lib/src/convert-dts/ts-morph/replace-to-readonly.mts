/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import {
  type ArrayTypeNode,
  type IndexSignatureDeclaration,
  type InterfaceDeclaration,
  type Node,
  SyntaxKind,
  type ts,
  type TupleTypeNode,
  type TypeReferenceNode,
} from 'ts-morph';
import { type SourceFile } from './types.mjs';

export const replaceToReadonly = (sourceFile: SourceFile): void => {
  convertArrayToBeReadonlyRec(sourceFile);
  convertMappedTypeToBeReadonly(sourceFile);
  convertTypeReferenceToBeReadonly(sourceFile);

  for (const node of sourceFile.getDescendants()) {
    convertToReadonly(node);
  }
};

const convertToReadonly = (node: Node): void => {
  if (node.wasForgotten()) return;

  if (node.isKind(SyntaxKind.ArrayType)) {
    convertArrayTypeNode(node);
  }

  if (node.isKind(SyntaxKind.TupleType)) {
    convertTupleTypeNode(node);
  }

  if (node.isKind(SyntaxKind.TypeReference)) {
    convertTypeReferenceNode(node);
  }

  if (node.isKind(SyntaxKind.IndexSignature)) {
    convertIndexSignature(node);
  }

  if (node.isKind(SyntaxKind.InterfaceDeclaration)) {
    convertInterfaceDeclaration(node);
  }
};

const convertArrayTypeNode = (node: ArrayTypeNode): void => {};

const convertTupleTypeNode = (node: TupleTypeNode): void => {
  const parent = node.getParent();
  if (
    parent.isKind(SyntaxKind.TypeOperator) &&
    parent.getOperator() === SyntaxKind.ReadonlyKeyword
  ) {
    return;
  }

  node.replaceWithText(`(readonly ${node.getText()})`);
};

const convertIndexSignature = (node: IndexSignatureDeclaration): void => {
  if (
    node
      .getModifiers()
      .some((modifier) => modifier.isKind(SyntaxKind.ReadonlyKeyword))
  ) {
    return;
  }
  node.setIsReadonly(true);
};

const convertInterfaceDeclaration = (node: InterfaceDeclaration): void => {
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
};

const convertTypeReferenceNode = (node: TypeReferenceNode): void => {
  const typeName = node.getTypeName().getText();

  // Array<T> to readonly T[]
  if (typeName === 'Array') {
    const typeArguments = node.getTypeArguments();
    if (typeArguments.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const elementType = typeArguments[0]!;
      node.replaceWithText(`(readonly ${elementType.getText()}[])`);
    }
  }

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
};

/** 配列型 T[] を readonly T[] に変換 (再帰的に処理) */
const convertArrayToBeReadonlyRec = (sourceFile: SourceFile): void => {
  const convertArrayToBeReadonly = (mut_node: ArrayTypeNode): void => {
    {
      const elementTypeNode = mut_node.getElementTypeNode(); // T in T[]

      if (elementTypeNode.isKind(SyntaxKind.ArrayType)) {
        convertArrayToBeReadonly(elementTypeNode); // ネストした配列型を再帰的に処理
      }
    }

    {
      const parent = mut_node.getParent();
      if (
        parent.isKind(SyntaxKind.TypeOperator) &&
        parent.getOperator() === SyntaxKind.ReadonlyKeyword
      ) {
        return; // skip if already readonly
      }

      const elementTypeNode = mut_node.getElementTypeNode(); // T in T[]
      const elementTypeText = elementTypeNode.getText(); // 更新されたテキストを取得
      mut_node.replaceWithText(`(readonly ${elementTypeText}[])`);
    }
  };

  for (const node of sourceFile.getDescendantsOfKind(SyntaxKind.ArrayType)) {
    if (node.wasForgotten()) continue;
    convertArrayToBeReadonly(node);
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
