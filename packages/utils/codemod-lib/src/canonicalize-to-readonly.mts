/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { Arr, noop } from '@noshiro/ts-utils';
import {
  type ClassDeclaration,
  type InterfaceDeclaration,
  type IntersectionTypeNode,
  type MappedTypeNode,
  type Node,
  SyntaxKind,
  ts,
  type TupleTypeNode,
  type TypeLiteralNode,
  type TypeNode,
  type TypeReferenceNode,
  type UnionTypeNode,
} from 'ts-morph';
import { type SourceFile } from './types.mjs';

export const canonicalizeToReadonly = (sourceFile: SourceFile): void => {
  sourceFile.transform((traversal) => {
    const node: ts.Node = traversal.visitChildren();

    console.debug(`${node.getText()}  (kind=${ts.SyntaxKind[node.kind]})`);

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
      case ts.SyntaxKind.InterfaceDeclaration:
      case ts.SyntaxKind.MappedType:
      case ts.SyntaxKind.ArrayType:
      case ts.SyntaxKind.TupleType:
      case ts.SyntaxKind.TypeLiteral:
      case ts.SyntaxKind.TypeReference:
      case ts.SyntaxKind.IntersectionType:
      case ts.SyntaxKind.UnionType:
        return ts.isTypeNode(node) ? transformNode(node) : node;

      default:
        return node;
    }
  });
};

/** Convert all nodes to readonly type (recursively) */
const transformNode = (node: ts.TypeNode): ts.TypeNode => {
  if (ts.isArrayTypeNode(node)) {
    return transformArrayTypeNode(node);
  }
  if (ts.isTupleTypeNode(node)) {
    return updateTupleTypeNode(node);
  }
  if (ts.isTypeLiteralNode(node)) {
    return updateTypeLiteralNode(node);
  }
  if (node.isKind(SyntaxKind.TypeReference)) {
    return updateTypeReferenceNode(node);
  }
  if (node.isKind(SyntaxKind.InterfaceDeclaration)) {
    return updateInterfaceDeclarationNode(node);
  }
  if (node.isKind(SyntaxKind.ClassDeclaration)) {
    return updateClassDeclarationNode(node);
  }
  if (node.isKind(SyntaxKind.MappedType)) {
    return updateMappedTypeNode(node);
  }
  if (node.isKind(SyntaxKind.IntersectionType)) {
    return updateIntersectionTypeNode(node);
  }
  if (node.isKind(SyntaxKind.UnionType)) {
    return updateUnionTypeNode(node);
  }
  // if (node.isKind(SyntaxKind.ParenthesizedType)) {
  //   const innerElem = node.getTypeNode(); // T in (T)
  //   updateNode(innerElem);
  //   node.replaceWithText(node.getText());
  //   return;
  // }
  noop();
};

/** Converts an array type `T[]` to a `readonly T[]` */
const transformArrayTypeNode = (node: ts.ArrayTypeNode): ts.TypeNode => {
  // Recursive processing
  const T = transformNode(node.elementType);

  {
    const parent: ts.Node = node.parent;
    if (
      ts.isTypeOperatorNode(parent) &&
      parent.operator === ts.SyntaxKind.ReadonlyKeyword
    ) {
      return ts.factory.createTypeOperatorNode(
        ts.SyntaxKind.ReadonlyKeyword,
        ts.factory.createArrayTypeNode(T),
      );
    }
    if (ts.isRestTypeNode(parent)) {
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
    if (el.isKind(SyntaxKind.NamedTupleMember)) {
      transformNode(el.getTypeNode());
    } else {
      transformNode(el);
    }
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

// Convert `{ member: X }` to a `Readonly<{ member: X }>`
const updateTypeLiteralNode = (node: TypeLiteralNode): void => {
  // Recursive processing
  for (const mb of node.getMembers()) {
    if (mb.isKind(SyntaxKind.PropertySignature)) {
      mb.setIsReadonly(false);
      const n = mb.getTypeNode();
      if (n !== undefined) {
        transformNode(n);
      }
    }
    if (mb.isKind(SyntaxKind.IndexSignature)) {
      mb.setIsReadonly(false);
      const v = mb.getReturnTypeNode();
      if (v !== undefined) {
        transformNode(v);
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

const updateTypeReferenceNode = (node: TypeReferenceNode): void => {
  for (const arg of node.getTypeArguments()) {
    transformNode(arg);
  }

  const typeName = node.getTypeName().getText();

  // Array<T> / ReadonlyArray<T> to (readonly T[])
  if (typeName === 'Array' || typeName === 'ReadonlyArray') {
    const typeArguments = node.getTypeArguments();
    if (!Arr.isArrayOfLength1(typeArguments)) {
      console.warn(
        `Warning: Unexpected number of type arguments "${typeArguments.length}" for ${typeName}.`,
      );
      return;
    }

    const elementType = typeArguments[0];
    node.replaceWithText(`(readonly ${elementType.getText()}[])`);
    return;
  }

  // Set<T> to ReadonlySet<T>
  if (typeName === 'Set') {
    const typeArguments = node.getTypeArguments();

    if (!Arr.isArrayOfLength1(typeArguments)) {
      console.warn(
        `Warning: Unexpected number of type arguments "${typeArguments.length}" for Set.`,
      );
      return;
    }

    const elementType = typeArguments[0];
    node.replaceWithText(`ReadonlySet<${elementType.getText()}>`);
    return;
  }

  // Map<T> to ReadonlyMap<T>
  if (typeName === 'Map') {
    const typeArguments = node.getTypeArguments();

    if (!Arr.isArrayOfLength2(typeArguments)) {
      console.warn(
        `Warning: Unexpected number of type arguments "${typeArguments.length}" for Map.`,
      );
      return;
    }

    const keyType = typeArguments[0];
    const valueType = typeArguments[1];
    node.replaceWithText(
      `ReadonlyMap<${keyType.getText()}, ${valueType.getText()}>`,
    );
    return;
  }

  // remove unnecessary `Readonly` wrappers
  if (typeName === 'Readonly') {
    console.debug('updateTypeReference/Readonly:node', node.getText());

    {
      const typeArg = node.getTypeArguments();

      if (!Arr.isArrayOfLength1(typeArg)) {
        console.warn(
          `Warning: Unexpected number of type arguments "${typeArg.length}" for Readonly.`,
        );
        return;
      }

      transformNode(removeRedundantParentheses(typeArg[0]));
    }

    const typeArguments = node.getTypeArguments();

    if (!Arr.isArrayOfLength1(typeArguments)) {
      console.warn(
        `Warning: Unexpected number of type arguments "${typeArguments.length}" for Readonly.`,
      );
      return;
    }

    const elementTypeNode = removeRedundantParentheses(typeArguments[0]);

    console.debug(
      'updateTypeReference/Readonly:elementType',
      elementTypeNode.getText(),
    );

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
      if (!Arr.isArrayOfLength1(typeArg)) {
        console.warn(
          `Warning: Unexpected number of type arguments "${typeArg.length}" for Readonly.`,
        );
        return;
      }
      node.replaceWithText(`Readonly<${typeArg[0].getText()}>`);
      return;
    }
  }

  noop();
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
  {
    const v = node.getTypeNode();
    if (v !== undefined) {
      transformNode(v);
    }
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

/** Readonly<A> & Readonly<B> -> Readonly<A & B> */
const updateIntersectionTypeNode = (node: IntersectionTypeNode): void => {
  // Recursive processing
  for (const tn of node.getTypeNodes()) {
    transformNode(tn);
  }

  const typeNodes = node.getTypeNodes();

  console.debug(
    'updateIntersection:typeNodes',
    typeNodes.map((t) => t.getText()),
  );

  if (
    typeNodes.every((type) => type.isKind(SyntaxKind.TypeReference)) &&
    typeNodes.every(
      (type) =>
        type.getTypeName().getText() === 'Readonly' &&
        Arr.isArrayOfLength1(type.getTypeArguments()),
    )
  ) {
    // Readonly<*> & ... & Readonly<*>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const args = typeNodes.map((type) => type.getTypeArguments()[0]!);

    console.debug(
      'updateIntersection:args',
      args.map((a) => a.getText()),
    );

    node.replaceWithText(
      `Readonly<${args.map((a) => a.getText()).join(' & ')}>`,
    );
  }
};

/** Readonly<A> | Readonly<B> -> Readonly<A | B> */
const updateUnionTypeNode = (node: UnionTypeNode): void => {
  console.debug('Union', node.getText());

  // Recursive processing
  for (const tn of node.getTypeNodes()) {
    transformNode(tn);
  }

  const typeNodes = node.getTypeNodes();

  if (
    typeNodes.every((type) => type.isKind(SyntaxKind.TypeReference)) &&
    typeNodes.every(
      (type) =>
        type.getTypeName().getText() === 'Readonly' &&
        Arr.isArrayOfLength1(type.getTypeArguments()),
    )
  ) {
    // Readonly<*> & ... & Readonly<*>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const args = typeNodes.map((type) => type.getTypeArguments()[0]!);

    node.replaceWithText(
      `Readonly<${args.map((a) => a.getText()).join(' | ')}>`,
    );
  }
};

/** Convert ((T)) -> (T) */
const removeRedundantParentheses = (node: TypeNode): TypeNode =>
  node.isKind(SyntaxKind.ParenthesizedType)
    ? removeRedundantParentheses(node.getTypeNode())
    : node;
