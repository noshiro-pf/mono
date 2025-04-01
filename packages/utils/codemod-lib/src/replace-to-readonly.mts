/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import {
  type ArrayTypeNode,
  type ClassDeclaration,
  type IndexSignatureDeclaration,
  type InterfaceDeclaration,
  type MappedTypeNode,
  type NamedTupleMember,
  type Node,
  type ParenthesizedTypeNode,
  SyntaxKind,
  type ts,
  type TupleTypeNode,
  type TypeLiteralNode,
  type TypeNode,
  type TypeReferenceNode,
} from 'ts-morph';
import { type SourceFile } from './types.mjs';

// eslint-disable-next-line functional/immutable-data
console.debug = () => {};

export const canonicalizeToReadonly = (sourceFile: SourceFile): void => {
  sourceFile.forEachDescendant((node) => {
    const kind = node.getKind();
    if (
      kind === SyntaxKind.ClassDeclaration ||
      kind === SyntaxKind.InterfaceDeclaration ||
      kind === SyntaxKind.MappedType ||
      kind === SyntaxKind.ArrayType ||
      kind === SyntaxKind.TupleType ||
      kind === SyntaxKind.TypeLiteral ||
      kind === SyntaxKind.IndexSignature ||
      kind === SyntaxKind.NamedTupleMember ||
      kind === SyntaxKind.TypeReference ||
      kind === SyntaxKind.ParenthesizedType
    ) {
      updateNode(node);
    }
  });
};

/** Convert all nodes to readonly type (recursively) */
const updateNode = (node: Node): void => {
  if (node.wasForgotten()) return;

  if (node.isKind(SyntaxKind.ArrayType)) {
    updateArrayTypeNode(node);
    return;
  }
  if (node.isKind(SyntaxKind.TupleType)) {
    updateTupleTypeNode(node);
    return;
  }
  if (node.isKind(SyntaxKind.NamedTupleMember)) {
    updateNamedTupleMember(node);
    return;
  }
  if (node.isKind(SyntaxKind.TypeLiteral)) {
    updateTypeLiteralNode(node);
    return;
  }
  if (node.isKind(SyntaxKind.TypeReference)) {
    updateTypeReferenceNode(node);
    return;
  }
  if (node.isKind(SyntaxKind.IndexSignature)) {
    updateIndexSignatureNode(node);
    return;
  }
  if (node.isKind(SyntaxKind.InterfaceDeclaration)) {
    updateInterfaceDeclarationNode(node);
    return;
  }
  if (node.isKind(SyntaxKind.ClassDeclaration)) {
    updateClassDeclarationNode(node);
    return;
  }
  if (node.isKind(SyntaxKind.MappedType)) {
    updateMappedTypeNode(node);
    return;
  }
  if (node.isKind(SyntaxKind.ParenthesizedType)) {
    const innerElem = node.getTypeNode(); // T in (T)
    updateNode(innerElem);
  }
};

/** Converts an array type `T[]` to a `readonly T[]` */
const updateArrayTypeNode = (node: ArrayTypeNode): void => {
  // Recursive processing
  updateNode(node.getElementTypeNode());

  {
    const parent: Node = node.getParent();
    if (
      parent.isKind(SyntaxKind.TypeOperator) &&
      parent.getOperator() === SyntaxKind.ReadonlyKeyword
    ) {
      return; // skip if already readonly
    }
    if (parent.isKind(SyntaxKind.RestType)) {
      return; // skip if ...T[]
    }
  }

  const elementTypeText: string = node.getElementTypeNode().getText(); // T in T[]

  node.replaceWithText(`(readonly ${elementTypeText}[])`);
};

/** Convert a tuple type `[T1, T2, T3]` to a `readonly [T1, T2, T3]` */
const updateTupleTypeNode = (node: TupleTypeNode): void => {
  // Recursive processing
  for (const el of node.getElements()) {
    updateNode(el);
  }

  {
    const parent = node.getParent();
    if (
      parent.isKind(SyntaxKind.TypeOperator) &&
      parent.getOperator() === SyntaxKind.ReadonlyKeyword
    ) {
      return; // skip if already readonly
    }
  }

  node.replaceWithText(`(readonly ${node.getText()})`);
};

const updateNamedTupleMember = (node: NamedTupleMember): void => {
  updateNode(node.getTypeNode());
};

// Convert `{ member: X }` to a `Readonly<{ member: X }>`
const updateTypeLiteralNode = (node: TypeLiteralNode): void => {
  // Recursive processing
  for (const mb of node.getMembers()) {
    if (mb.isKind(SyntaxKind.PropertySignature)) {
      mb.setIsReadonly(false);
      const n = mb.getTypeNode();
      if (n !== undefined) {
        updateNode(n);
      }
    }
    if (mb.isKind(SyntaxKind.IndexSignature)) {
      mb.setIsReadonly(false);
      const v = mb.getReturnTypeNode();
      if (v !== undefined) {
        updateNode(v);
      }
    }
  }
  {
    const p = node.getParent();

    // Skip if already of type `Readonly<{ member: X }>`
    if (
      p.isKind(SyntaxKind.TypeReference) &&
      p.getTypeName().getText() === 'Readonly'
    ) {
      return;
    }

    node.replaceWithText(`Readonly<${node.getText()}>`);
  }
};

// Making interface members readonly
const updateInterfaceDeclarationNode = (node: InterfaceDeclaration): void => {
  for (const member of node.getMembers()) {
    if (member.isKind(SyntaxKind.PropertySignature)) {
      member.setIsReadonly(true);
    }
    if (member.isKind(SyntaxKind.IndexSignature)) {
      member.setIsReadonly(true);
    }
  }
};

const updateClassDeclarationNode = (node: ClassDeclaration): void => {
  for (const el of node.getDescendants()) {
    if (el.isKind(SyntaxKind.IndexSignature)) {
      el.setIsReadonly(true);
    }
    if (el.isKind(SyntaxKind.PropertyDeclaration)) {
      el.setIsReadonly(true);
    }
  }

  for (const ctor of node.getConstructors()) {
    for (const parameter of ctor.getParameters()) {
      parameter.setIsReadonly(true);
    }
  }
};

const updateIndexSignatureNode = (node: IndexSignatureDeclaration): void => {
  const v = node.getReturnTypeNode();
  if (v !== undefined) {
    updateNode(v);
  }
};

const updateTypeReferenceNode = (node: TypeReferenceNode): void => {
  for (const arg of node.getTypeArguments()) {
    updateNode(arg);
  }

  const typeName = node.getTypeName().getText();

  // Array<T> / ReadonlyArray<T> to (readonly T[])
  if (typeName === 'Array' || typeName === 'ReadonlyArray') {
    const typeArguments = node.getTypeArguments();
    if (typeArguments.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const elementType = typeArguments[0]!;
      node.replaceWithText(`(readonly ${elementType.getText()}[])`);
    } else {
      console.warn(
        `Warning: Unexpected number of type arguments "${typeArguments.length}" for Array.`,
      );
    }
  }

  // Set<T> to ReadonlySet<T>
  if (typeName === 'Set') {
    const typeArguments = node.getTypeArguments();
    if (typeArguments.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const elementType = typeArguments[0]!;
      node.replaceWithText(`ReadonlySet<${elementType.getText()}>`);
    } else {
      console.warn(
        `Warning: Unexpected number of type arguments "${typeArguments.length}" for Set.`,
      );
    }
    return;
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
    } else {
      console.warn(
        `Warning: Unexpected number of type arguments "${typeArguments.length}" for Map.`,
      );
    }
    return;
  }

  // remove unnecessary `Readonly` wrappers
  if (typeName === 'Readonly') {
    const typeArguments = node.getTypeArguments();

    if (typeArguments.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let mut_elementTypeNode = typeArguments[0]!;
      {
        if (mut_elementTypeNode.isKind(SyntaxKind.ParenthesizedType)) {
          mut_elementTypeNode =
            removeMultipleNestedParentheses(mut_elementTypeNode);
        }

        updateNode(mut_elementTypeNode);
      }

      const elementTypeNode = mut_elementTypeNode;

      // Readonly<readonly T[]> -> readonly T[]
      if (
        elementTypeNode.isKind(SyntaxKind.TypeOperator) &&
        elementTypeNode.getOperator() === SyntaxKind.ReadonlyKeyword
      ) {
        node.replaceWithText(elementTypeNode.getText());
        return;
      }

      // Readonly<Readonly<T>> -> Readonly<T'>
      if (
        elementTypeNode.isKind(SyntaxKind.TypeReference) &&
        elementTypeNode.getTypeName().getText() === 'Readonly'
      ) {
        const typeArg = elementTypeNode.getTypeArguments();
        if (typeArg.length === 1) {
          // // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          // const elemType = typeArg[0]!; // T in Readonly<T>
          // updateNode(elemType);

          node.replaceWithText(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            `Readonly<${elementTypeNode.getTypeArguments()[0]!.getText()}>`,
          );
          return;
        } else {
          console.warn(
            `Warning: Unexpected number of type arguments "${typeArguments.length}" for Readonly.`,
          );
        }
      }
    } else {
      console.warn(
        `Warning: Unexpected number of type arguments "${typeArguments.length}" for Map.`,
      );
    }
  }

  console.debug(typeName);
};

/**
 * Convert
 *
 *     { [key in Obj]: V }
 *     { -readonly [key in Obj]: V }
 *     { readonly [key in Obj]: V }
 *     { +readonly [key in Obj]: V }
 *
 * To
 *
 *     Readonly<{ [key in Obj]: V }>;
 */
const updateMappedTypeNode = (node: MappedTypeNode): void => {
  const v = node.getTypeNode();
  if (v !== undefined) {
    updateNode(v);
  }

  const readonlyToken = node.getReadonlyToken() satisfies
    | Node<ts.ReadonlyKeyword>
    | Node<ts.PlusToken>
    | Node<ts.MinusToken>
    | undefined;

  if (readonlyToken !== undefined) {
    switch (
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      readonlyToken.getKind() as
        | SyntaxKind.ReadonlyKeyword
        | SyntaxKind.PlusToken
        | SyntaxKind.MinusToken
    ) {
      case SyntaxKind.ReadonlyKeyword:
        node.replaceWithText(node.getText().replace(/^\{\s*readonly/u, '{'));
        break;

      case SyntaxKind.PlusToken:
        node.replaceWithText(node.getText().replace(/^\{\s*\+readonly/u, '{'));
        break;

      case SyntaxKind.MinusToken:
        node.replaceWithText(node.getText().replace(/^\{\s*-readonly/u, '{'));
        break;
    }
  }

  {
    const p = node.getParent();

    // Skip if already of type `Readonly<{ [key: string]: string }>`
    if (
      p.isKind(SyntaxKind.TypeReference) &&
      p.getTypeName().getText() === 'Readonly'
    ) {
      return;
    }

    node.replaceWithText(`Readonly<${node.getText()}>`);
  }
};

/** Convert all nodes recursively */
const removeMultipleNestedParentheses = (
  node: ParenthesizedTypeNode,
): TypeNode => {
  const innerElem = node.getTypeNode();

  // ((T)) -> (T)
  return innerElem.isKind(SyntaxKind.ParenthesizedType)
    ? removeMultipleNestedParentheses(innerElem)
    : innerElem;
};
