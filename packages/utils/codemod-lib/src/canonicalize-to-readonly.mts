/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { Arr, mapOptional, noop } from '@noshiro/ts-utils';
import { type Node, SyntaxKind, ts, type TypeNode } from 'ts-morph';
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
        return transformNode(node);

      default:
        return node;
    }
  });
};

// type TargetNodeTypes =
//   | ts.ArrayTypeNode
//   | ts.TupleTypeNode
//   | ts.TypeLiteralNode
//   | ts.TypeReferenceNode
//   | ts.InterfaceDeclaration
//   | ts.ClassDeclaration
//   | ts.MappedTypeNode
//   | ts.IntersectionTypeNode
//   | ts.UnionTypeNode;

type TransformNodeFn = ((
  node: ts.InterfaceDeclaration,
) => ts.InterfaceDeclaration) &
  ((node: ts.ClassDeclaration) => ts.ClassDeclaration) &
  ((node: ts.TypeNode) => ts.TypeNode);

/** Convert all nodes to readonly type (recursively) */
// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const transformNode: TransformNodeFn = ((node) => {
  if (ts.isArrayTypeNode(node)) {
    return transformArrayTypeNode(node);
  }
  if (ts.isTupleTypeNode(node)) {
    return transformTupleTypeNode(node);
  }
  if (ts.isTypeLiteralNode(node)) {
    return transformTypeLiteralNode(node);
  }
  if (ts.isTypeReferenceNode(node)) {
    return transformTypeReferenceNode(node);
  }
  if (ts.isInterfaceDeclaration(node)) {
    return transformInterfaceDeclarationNode(node);
  }
  if (ts.isClassDeclaration(node)) {
    return transformClassDeclarationNode(node);
  }
  if (ts.isMappedTypeNode(node)) {
    return transformMappedTypeNode(node);
  }
  if (ts.isIntersectionTypeNode(node)) {
    return transformIntersectionTypeNode(node);
  }
  if (ts.isUnionTypeNode(node)) {
    return transformUnionTypeNode(node);
  }
  // if (node.isKind(SyntaxKind.ParenthesizedType)) {
  //   const innerElem = node.getTypeNode(); // T in (T)
  //   updateNode(innerElem);
  //   node.replaceWithText(node.getText());
  //   return;
  // }

  return node;
}) as TransformNodeFn;

/** Converts an array type `T[]` to a `readonly T[]` */
const transformArrayTypeNode = (
  node: ts.ArrayTypeNode,
): ts.ArrayTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const T = transformNode(node.elementType);

  {
    const parent: ts.Node = node.parent;
    if (
      ts.isTypeOperatorNode(parent) &&
      parent.operator === ts.SyntaxKind.ReadonlyKeyword
    ) {
      // skip if already readonly
      return ts.factory.createArrayTypeNode(T);
    }

    // skip if ...T[]
    if (ts.isRestTypeNode(parent)) {
      return ts.factory.createArrayTypeNode(T);
    }
  }

  return ts.factory.createTypeOperatorNode(
    ts.SyntaxKind.ReadonlyKeyword,
    ts.factory.createArrayTypeNode(T),
  );
};

/** Convert a tuple type `[T1, T2, T3]` to a `readonly [T1, T2, T3]` */
const transformTupleTypeNode = (
  node: ts.TupleTypeNode,
): ts.TupleTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const Ts = node.elements.map((el) =>
    ts.isNamedTupleMember(el)
      ? ts.factory.updateNamedTupleMember(
          el,
          undefined,
          el.name,
          undefined,
          transformNode(el.type),
        )
      : transformNode(el),
  );

  {
    const parent = node.parent;
    if (
      ts.isTypeOperatorNode(parent) &&
      parent.operator === ts.SyntaxKind.ReadonlyKeyword
    ) {
      // skip if already readonly
      return ts.factory.updateTupleTypeNode(node, Ts); // [T1, T2, T3]
    }
  }

  // readonly [T1, T2, T3]
  return ts.factory.createTypeOperatorNode(
    ts.SyntaxKind.ReadonlyKeyword,
    ts.factory.updateTupleTypeNode(node, Ts),
  );
};

// Convert `{ member: X }` to a `Readonly<{ member: X }>`
const transformTypeLiteralNode = (
  node: ts.TypeLiteralNode,
): ts.TypeLiteralNode | ts.TypeReferenceNode => {
  // Recursive processing
  const members: ts.NodeArray<ts.TypeElement> = transformMembers(node.members);

  {
    const parent = node.parent;
    // Skip if already of type `Readonly<{ member: X }>`
    if (
      ts.isTypeReferenceNode(parent) &&
      parent.typeName.getText() === 'Readonly'
    ) {
      // skip if already readonly
      return ts.factory.updateTypeLiteralNode(node, members);
    }
  }

  return ts.factory.createTypeReferenceNode('Readonly', [
    ts.factory.updateTypeLiteralNode(node, members),
  ]);
};

// Making interface members readonly
const transformInterfaceDeclarationNode = (
  node: ts.InterfaceDeclaration,
): ts.InterfaceDeclaration =>
  ts.factory.createInterfaceDeclaration(
    node.modifiers?.filter(removeReadonlyModifier),
    node.name,
    node.typeParameters?.map(transformTypeParameterDeclaration),
    node.heritageClauses?.map((hc) =>
      ts.factory.createHeritageClause(
        hc.token,
        hc.types.map((t) =>
          ts.factory.createExpressionWithTypeArguments(
            t.expression,
            t.typeArguments?.map(transformNode),
          ),
        ),
      ),
    ),
    transformMembers(node.members),
  );

const transformClassDeclarationNode = (
  node: ts.ClassDeclaration,
): ts.ClassDeclaration => {
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

const transformTypeReferenceNode = (
  node: ts.TypeReferenceNode,
): ts.TypeNode => {
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
const transformMappedTypeNode = (
  node: ts.MappedTypeNode,
): ts.MappedTypeNode | ts.TypeReferenceNode => {
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
const transformIntersectionTypeNode = (
  node: ts.IntersectionTypeNode,
): ts.IntersectionTypeNode | ts.TypeReferenceNode => {
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
const transformUnionTypeNode = (node: ts.UnionTypeNode): ts.TypeNode => {
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

const transformMembers = (
  members: ts.NodeArray<ts.TypeElement>,
): ts.NodeArray<ts.TypeElement> =>
  ts.factory.createNodeArray(
    members.map((mb) => {
      if (ts.isPropertySignature(mb)) {
        return ts.factory.createPropertySignature(
          mb.modifiers?.filter(removeReadonlyModifier),
          mb.name,
          mb.questionToken,
          mapOptional(mb.type, transformNode),
        );
      }
      if (ts.isIndexSignatureDeclaration(mb)) {
        return ts.factory.createIndexSignature(
          mb.modifiers?.filter(removeReadonlyModifier),
          mb.parameters.map(transformParameterDeclaration),
          transformNode(mb.type),
        );
      }
      if (ts.isMethodSignature(mb)) {
        return ts.factory.createMethodSignature(
          mb.modifiers?.filter(removeReadonlyModifier),
          mb.name,
          mb.questionToken,
          mb.typeParameters?.map(transformTypeParameterDeclaration),
          mb.parameters.map(transformParameterDeclaration),
          mapOptional(mb.type, transformNode),
        );
      }
      if (ts.isCallSignatureDeclaration(mb)) {
        return ts.factory.createCallSignature(
          mb.typeParameters?.map(transformTypeParameterDeclaration),
          mb.parameters.map(transformParameterDeclaration),
          mapOptional(mb.type, transformNode),
        );
      }
      if (ts.isConstructSignatureDeclaration(mb)) {
        return ts.factory.createConstructSignature(
          mb.typeParameters?.map(transformTypeParameterDeclaration),
          mb.parameters.map(transformParameterDeclaration),
          mapOptional(mb.type, transformNode),
        );
      }
      if (ts.isGetAccessorDeclaration(mb)) {
        return ts.factory.createGetAccessorDeclaration(
          mb.modifiers?.filter(removeReadonlyModifier),
          mb.name,
          mb.parameters.map(transformParameterDeclaration),
          mapOptional(mb.type, transformNode),
          mb.body,
        );
      }
      if (ts.isSetAccessorDeclaration(mb)) {
        return ts.factory.createSetAccessorDeclaration(
          mb.modifiers?.filter(removeReadonlyModifier),
          mb.name,
          mb.parameters.map(transformParameterDeclaration),
          mb.body,
        );
      }

      throw new TypeError(`Unexpected type of node: ${ts.SyntaxKind[mb.kind]}`);
    }),
    members.hasTrailingComma,
  );

const transformTypeParameterDeclaration = (
  tp: ts.TypeParameterDeclaration,
): ts.TypeParameterDeclaration =>
  ts.factory.createTypeParameterDeclaration(
    tp.modifiers,
    tp.name,
    mapOptional(tp.constraint, transformNode),
    mapOptional(tp.default, transformNode),
  );

const transformParameterDeclaration = (
  p: ts.ParameterDeclaration,
): ts.ParameterDeclaration =>
  ts.factory.createParameterDeclaration(
    p.modifiers?.filter(removeReadonlyModifier),
    p.dotDotDotToken,
    p.name,
    p.questionToken,
    mapOptional(p.type, transformNode),
    p.initializer,
  );

const removeReadonlyModifier = (m: ts.ModifierLike): boolean =>
  !ts.isReadonlyKeywordOrPlusOrMinusToken(m);
