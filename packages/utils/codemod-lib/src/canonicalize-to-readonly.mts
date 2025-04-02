/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { Arr, mapOptional, match, noop } from '@noshiro/ts-utils';
import { SyntaxKind, ts } from 'ts-morph';
import { type SourceFile } from './types.mjs';

export const canonicalizeToReadonly = (sourceFile: SourceFile): void => {
  sourceFile.transform((traversal) => {
    const node: ts.Node = traversal.visitChildren();

    console.debug(`${node.getText()}  (kind=${ts.SyntaxKind[node.kind]})`);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return transformNode(node as ts.TypeNode);
  });
};

type TransformNodeFn = ((
  node: ts.InterfaceDeclaration,
) => ts.InterfaceDeclaration) &
  ((node: ts.ClassDeclaration) => ts.ClassDeclaration) &
  ((node: ts.TypeNode) => ts.TypeNode);

/** Convert all nodes to readonly type (recursively) */
// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const transformNode: TransformNodeFn = ((node) => {
  // NOTE: The ts.is* functions are not used to improve performance with a switch statement.

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (node.kind) {
    case ts.SyntaxKind.ArrayType:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return transformArrayTypeNode(node as ts.ArrayTypeNode);
    case ts.SyntaxKind.TupleType:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return transformTupleTypeNode(node as ts.TupleTypeNode);
    case ts.SyntaxKind.TypeLiteral:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return transformTypeLiteralNode(node as ts.TypeLiteralNode);
    case ts.SyntaxKind.TypeReference:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return transformTypeReferenceNode(node as ts.TypeReferenceNode);
    case ts.SyntaxKind.InterfaceDeclaration:
      return transformInterfaceDeclarationNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.InterfaceDeclaration,
      );
    case ts.SyntaxKind.ClassDeclaration:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return transformClassDeclarationNode(node as ts.ClassDeclaration);
    case ts.SyntaxKind.MappedType:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return transformMappedTypeNode(node as ts.MappedTypeNode);
    case ts.SyntaxKind.IntersectionType:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return transformIntersectionTypeNode(node as ts.IntersectionTypeNode);
    case ts.SyntaxKind.UnionType:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return transformUnionTypeNode(node as ts.UnionTypeNode);
    case ts.SyntaxKind.ParenthesizedType:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return transformParenthesizedTypeNode(node as ts.ParenthesizedTypeNode);

    default:
      return node;
  }
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

  return createReadonlyArrayTypeNode(T);
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

  return createReadonlyTypeNode(newTypeLiteralNode);
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
  // Recursive processing
  const newTypeArguments = node.typeArguments?.map(transformNode) ?? [];

  const typeName = node.typeName.getText();

  // Array<T> / ReadonlyArray<T> to readonly T[]
  if (typeName === 'Array' || typeName === 'ReadonlyArray') {
    if (!Arr.isArrayOfLength1(newTypeArguments)) {
      throw new Error(
        `Warning: Unexpected number of type arguments "${newTypeArguments.length}" for ${typeName}.`,
      );
    }

    return createReadonlyArrayTypeNode(newTypeArguments[0]);
  }

  // Set<T> to ReadonlySet<T>
  if (typeName === 'Set') {
    if (!Arr.isArrayOfLength1(newTypeArguments)) {
      throw new Error(
        `Warning: Unexpected number of type arguments "${newTypeArguments.length}" for Set.`,
      );
    }

    return ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier('ReadonlySet'),
      newTypeArguments,
    );
  }

  // Map<T> to ReadonlyMap<T>
  if (typeName === 'Map') {
    if (!Arr.isArrayOfLength2(newTypeArguments)) {
      throw new Error(
        `Warning: Unexpected number of type arguments "${newTypeArguments.length}" for Map.`,
      );
    }

    return ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier('ReadonlyMap'),
      newTypeArguments,
    );
  }

  // remove unnecessary `Readonly` wrappers
  if (typeName === 'Readonly') {
    {
      if (!Arr.isArrayOfLength1(newTypeArguments)) {
        throw new Error(
          `Warning: Unexpected number of type arguments "${newTypeArguments.length}" for Readonly.`,
        );
      }
    }

    const T = newTypeArguments[0];

    transformNode(removeRedundantParentheses(typeArg[0]));

    const elementTypeNode = removeRedundantParentheses(T);

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

  return createReadonlyTypeNode(newMappedTypeNode);
};

/** Readonly<A> & Readonly<B> -> Readonly<A & B> */
const transformIntersectionTypeNode = (
  node: ts.IntersectionTypeNode,
): ts.IntersectionTypeNode | ts.TypeReferenceNode => {
  // Recursive processing
  const newTypes = node.types.map(transformNode);

  if (
    newTypes.every(ts.isTypeReferenceNode) &&
    newTypes.every(
      (type) =>
        type.typeName.getText() === 'Readonly' &&
        type.typeArguments !== undefined &&
        Arr.isArrayOfLength1(type.typeArguments),
    )
  ) {
    // Readonly<*> & ... & Readonly<*>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const args = newTypes.map((type) => type.typeArguments![0]!);

    return createReadonlyTypeNode(ts.factory.createIntersectionTypeNode(args));
  }

  return ts.factory.createIntersectionTypeNode(newTypes);
};

/** Readonly<A> | Readonly<B> -> Readonly<A | B> */
const transformUnionTypeNode = (node: ts.UnionTypeNode): ts.TypeNode => {
  // Recursive processing
  const newTypes = node.types.map(transformNode);

  if (
    newTypes.every(ts.isTypeReferenceNode) &&
    newTypes.every(
      (type) =>
        type.typeName.getText() === 'Readonly' &&
        type.typeArguments !== undefined &&
        Arr.isArrayOfLength1(type.typeArguments),
    )
  ) {
    // Readonly<*> | ... | Readonly<*>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const args = newTypes.map((type) => type.typeArguments![0]!);

    return createReadonlyTypeNode(ts.factory.createUnionTypeNode(args));
  }

  return ts.factory.createUnionTypeNode(newTypes);
};

/** Convert ((T)) -> (T) recursively */
const transformParenthesizedTypeNode = (
  node: ts.ParenthesizedTypeNode,
): ts.TypeNode =>
  ts.isParenthesizedTypeNode(node.type)
    ? transformParenthesizedTypeNode(node.type)
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

const createReadonlyTypeNode = (t: ts.TypeNode): ts.TypeReferenceNode =>
  ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Readonly'), [
    t,
  ]);

const createReadonlyArrayTypeNode = (t: ts.TypeNode): ts.TypeOperatorNode =>
  ts.factory.createTypeOperatorNode(
    ts.SyntaxKind.ReadonlyKeyword,
    ts.factory.createArrayTypeNode(t),
  );
