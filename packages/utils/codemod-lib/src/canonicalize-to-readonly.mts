/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { Arr, mapOptional, match, noop } from '@noshiro/ts-utils';
import { SyntaxKind, ts, type TypeNode } from 'ts-morph';
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
  const newTypeLiteralNode = ts.factory.updateTypeLiteralNode(
    node,
    // Recursive processing
    transformMembers(node.members, 'remove'),
  );

  {
    const parent = node.parent;
    // Skip if already of type `Readonly<{ member: X }>`
    if (
      ts.isTypeReferenceNode(parent) &&
      parent.typeName.getText() === 'Readonly'
    ) {
      // skip if already readonly
      return newTypeLiteralNode;
    }
  }

  return ts.factory.createTypeReferenceNode('Readonly', [newTypeLiteralNode]);
};

// Making interface members readonly
const transformInterfaceDeclarationNode = (
  node: ts.InterfaceDeclaration,
): ts.InterfaceDeclaration =>
  ts.factory.createInterfaceDeclaration(
    removeReadonlyFromModifiers(node.modifiers),
    node.name,
    node.typeParameters?.map(transformTypeParameterDeclaration),
    node.heritageClauses?.map(transformHeritageClause),
    transformMembers(node.members, 'add'),
  );

const transformClassDeclarationNode = (
  node: ts.ClassDeclaration,
): ts.ClassDeclaration =>
  ts.factory.createClassDeclaration(
    node.modifiers,
    node.name,
    node.typeParameters?.map(transformTypeParameterDeclaration),
    node.heritageClauses?.map(transformHeritageClause),
    node.members.map((mb: ts.ClassElement): ts.ClassElement => {
      if (ts.isPropertyDeclaration(mb)) {
        return ts.factory.createPropertyDeclaration(
          addReadonlyToModifiers(mb.modifiers),
          mb.name,
          mb.questionToken,
          mapOptional(mb.type, transformNode),
          mb.initializer,
        );
      }
      if (ts.isMethodDeclaration(mb)) {
        return ts.factory.createMethodDeclaration(
          addReadonlyToModifiers(mb.modifiers),
          mb.asteriskToken,
          mb.name,
          mb.questionToken,
          mb.typeParameters?.map(transformTypeParameterDeclaration),
          mb.parameters.map(transformParameterDeclaration),
          mapOptional(mb.type, transformNode),
          mb.body,
        );
      }
      if (ts.isConstructorDeclaration(mb)) {
        return ts.factory.createConstructorDeclaration(
          mb.modifiers,
          mb.parameters.map(transformParameterDeclaration),
          mb.body,
        );
      }
      if (ts.isGetAccessorDeclaration(mb)) {
        return transformGetAccessorDeclaration(mb, 'add');
      }
      if (ts.isSetAccessorDeclaration(mb)) {
        return transformSetAccessorDeclaration(mb, 'add');
      }
      if (ts.isIndexSignatureDeclaration(mb)) {
        return transformIndexSignatureDeclaration(mb, 'add');
      }
      if (ts.isClassStaticBlockDeclaration(mb)) {
        return ts.factory.createClassStaticBlockDeclaration(mb.body);
      }
      if (ts.isSemicolonClassElement(mb)) {
        return ts.factory.createSemicolonClassElement();
      }
      throw new TypeError(`Unexpected type of node: ${ts.SyntaxKind[mb.kind]}`);
    }),
  );

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
  const newMappedTypeNode = ts.factory.updateMappedTypeNode(
    node,
    undefined, // remove readonlyToken
    node.typeParameter,
    node.nameType,
    node.questionToken,
    mapOptional(node.type, transformNode),
    node.members,
  );

  {
    const parent = node.parent;
    // Skip if already of type `Readonly<{ member: X }>`
    if (
      ts.isTypeReferenceNode(parent) &&
      parent.typeName.getText() === 'Readonly'
    ) {
      // skip if already readonly
      return newMappedTypeNode;
    }
  }

  return ts.factory.createTypeReferenceNode('Readonly', [newMappedTypeNode]);
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

const transformPropertySignature = (
  node: ts.PropertySignature,
  readonly: 'add' | 'remove',
): ts.PropertySignature =>
  ts.factory.createPropertySignature(
    match(readonly, {
      add: addReadonlyToModifiers(node.modifiers),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.name,
    node.questionToken,
    mapOptional(node.type, transformNode),
  );

const transformIndexSignatureDeclaration = (
  node: ts.IndexSignatureDeclaration,
  readonly: 'add' | 'remove',
): ts.IndexSignatureDeclaration =>
  ts.factory.createIndexSignature(
    match(readonly, {
      add: addReadonlyToModifiers(node.modifiers),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.parameters.map(transformParameterDeclaration),
    transformNode(node.type),
  );

const transformMethodSignature = (
  node: ts.MethodSignature,
  readonly: 'add' | 'remove',
): ts.MethodSignature =>
  ts.factory.createMethodSignature(
    match(readonly, {
      add: addReadonlyToModifiers(node.modifiers),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.name,
    node.questionToken,
    node.typeParameters?.map(transformTypeParameterDeclaration),
    node.parameters.map(transformParameterDeclaration),
    mapOptional(node.type, transformNode),
  );

const transformCallSignatureDeclaration = (
  node: ts.CallSignatureDeclaration,
): ts.CallSignatureDeclaration =>
  ts.factory.createCallSignature(
    node.typeParameters?.map(transformTypeParameterDeclaration),
    node.parameters.map(transformParameterDeclaration),
    mapOptional(node.type, transformNode),
  );

const transformConstructSignatureDeclaration = (
  node: ts.ConstructSignatureDeclaration,
): ts.ConstructSignatureDeclaration =>
  ts.factory.createConstructSignature(
    node.typeParameters?.map(transformTypeParameterDeclaration),
    node.parameters.map(transformParameterDeclaration),
    mapOptional(node.type, transformNode),
  );

const transformGetAccessorDeclaration = (
  node: ts.GetAccessorDeclaration,
  readonly: 'add' | 'remove',
): ts.GetAccessorDeclaration =>
  ts.factory.createGetAccessorDeclaration(
    match(readonly, {
      add: addReadonlyToModifiers(node.modifiers),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.name,
    node.parameters.map(transformParameterDeclaration),
    mapOptional(node.type, transformNode),
    node.body,
  );

const transformSetAccessorDeclaration = (
  node: ts.SetAccessorDeclaration,
  readonly: 'add' | 'remove',
): ts.SetAccessorDeclaration =>
  ts.factory.createSetAccessorDeclaration(
    match(readonly, {
      add: addReadonlyToModifiers(node.modifiers),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.name,
    node.parameters.map(transformParameterDeclaration),
    node.body,
  );

const transformMembers = (
  members: ts.NodeArray<ts.TypeElement>,
  readonly: 'add' | 'remove',
): ts.NodeArray<ts.TypeElement> =>
  ts.factory.createNodeArray(
    members.map((mb) => {
      if (ts.isPropertySignature(mb)) {
        return transformPropertySignature(mb, readonly);
      }
      if (ts.isIndexSignatureDeclaration(mb)) {
        return transformIndexSignatureDeclaration(mb, readonly);
      }
      if (ts.isMethodSignature(mb)) {
        return transformMethodSignature(mb, readonly);
      }
      if (ts.isCallSignatureDeclaration(mb)) {
        return transformCallSignatureDeclaration(mb);
      }
      if (ts.isConstructSignatureDeclaration(mb)) {
        return transformConstructSignatureDeclaration(mb);
      }
      if (ts.isGetAccessorDeclaration(mb)) {
        return transformGetAccessorDeclaration(mb, readonly);
      }
      if (ts.isSetAccessorDeclaration(mb)) {
        return transformSetAccessorDeclaration(mb, readonly);
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
    removeReadonlyFromModifiers(p.modifiers),
    p.dotDotDotToken,
    p.name,
    p.questionToken,
    mapOptional(p.type, transformNode),
    p.initializer,
  );

const transformHeritageClause = (hc: ts.HeritageClause): ts.HeritageClause =>
  ts.factory.createHeritageClause(
    hc.token,
    hc.types.map((t) =>
      ts.factory.createExpressionWithTypeArguments(
        t.expression,
        t.typeArguments?.map(transformNode),
      ),
    ),
  );

const removeReadonlyFromModifiers = <M extends ts.ModifierLike>(
  modifiers: ts.NodeArray<M> | undefined,
): readonly M[] | undefined =>
  modifiers?.filter((m) => !ts.isReadonlyKeywordOrPlusOrMinusToken(m));

const addReadonlyToModifiers = <M extends ts.ModifierLike>(
  modifiers: ts.NodeArray<M> | undefined,
): readonly (M | ts.ReadonlyKeyword)[] | undefined =>
  mapOptional(modifiers, (ms) => [
    ...ms.filter((m) => !ts.isReadonlyKeywordOrPlusOrMinusToken(m)),
    ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
  ]);
