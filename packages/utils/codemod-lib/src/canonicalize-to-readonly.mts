/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { Arr, mapOptional, match } from '@noshiro/ts-utils';
import * as ts from 'typescript';
import { createTransformerFactory } from './utils/index.mjs';

export const canonicalizeToReadonly: ts.TransformerFactory<ts.SourceFile> =
  createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> =>
      ts.isTypeNode(node)
        ? transformNode(node, context)
        : ts.visitEachChild(node, visitor, context);

    return visitor;
  });

// transformNode(node as ts.TypeNode, sourceFile);

type TransformNodeFn = ((
  node: ts.InterfaceDeclaration,
  context: ts.TransformationContext,
) => ts.InterfaceDeclaration) &
  ((
    node: ts.ClassDeclaration,
    context: ts.TransformationContext,
  ) => ts.ClassDeclaration) &
  ((node: ts.TypeNode, context: ts.TransformationContext) => ts.TypeNode);

/** Convert all nodes to readonly type (recursively) */
// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const transformNode: TransformNodeFn = ((node, context) => {
  // NOTE: The ts.isX functions are not used to improve performance with a switch statement.

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (node.kind) {
    case ts.SyntaxKind.ArrayType:
      return transformArrayTypeNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.ArrayTypeNode,
        context,
      );
    case ts.SyntaxKind.TupleType:
      return transformTupleTypeNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.TupleTypeNode,
        context,
      );
    case ts.SyntaxKind.TypeLiteral:
      return transformTypeLiteralNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.TypeLiteralNode,
        context,
      );
    case ts.SyntaxKind.TypeReference:
      return transformTypeReferenceNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.TypeReferenceNode,
        context,
      );
    case ts.SyntaxKind.InterfaceDeclaration:
      return transformInterfaceDeclarationNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.InterfaceDeclaration,
        context,
      );
    case ts.SyntaxKind.ClassDeclaration:
      return transformClassDeclarationNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.ClassDeclaration,
        context,
      );
    case ts.SyntaxKind.MappedType:
      return transformMappedTypeNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.MappedTypeNode,
        context,
      );
    case ts.SyntaxKind.IntersectionType:
      return transformIntersectionTypeNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.IntersectionTypeNode,
        context,
      );
    case ts.SyntaxKind.UnionType:
      return transformUnionTypeNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.UnionTypeNode,
        context,
      );
    case ts.SyntaxKind.ParenthesizedType:
      return transformParenthesizedTypeNode(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node as ts.ParenthesizedTypeNode,
        context,
      );

    default:
      return node;
  }
}) as TransformNodeFn;

/** Converts an array type `T[]` to a `readonly T[]` */
const transformArrayTypeNode = (
  node: ts.ArrayTypeNode,
  context: ts.TransformationContext,
): ts.ArrayTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const T = transformNode(node.elementType, context);

  {
    const parent = node.parent as ts.Node | undefined;
    if (
      parent !== undefined &&
      ts.isTypeOperatorNode(parent) &&
      parent.operator === ts.SyntaxKind.ReadonlyKeyword
    ) {
      // skip if already readonly
      return context.factory.createArrayTypeNode(T);
    }

    // skip if ...T[]
    if (parent !== undefined && ts.isRestTypeNode(parent)) {
      return context.factory.createArrayTypeNode(T);
    }
  }

  return createReadonlyArrayTypeNode(T, context);
};

/** Convert a tuple type `[T1, T2, T3]` to a `readonly [T1, T2, T3]` */
const transformTupleTypeNode = (
  node: ts.TupleTypeNode,
  context: ts.TransformationContext,
): ts.TupleTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const Ts = node.elements.map((el) =>
    ts.isNamedTupleMember(el)
      ? context.factory.updateNamedTupleMember(
          el,
          undefined,
          el.name,
          undefined,
          transformNode(el.type, context),
        )
      : transformNode(el, context),
  );

  {
    const parent = node.parent as ts.Node | undefined;
    if (
      parent !== undefined &&
      ts.isTypeOperatorNode(parent) &&
      parent.operator === ts.SyntaxKind.ReadonlyKeyword
    ) {
      // skip if already readonly
      return context.factory.createTupleTypeNode(Ts); // [T1, T2, T3]
    }
  }

  // readonly [T1, T2, T3]
  return context.factory.createTypeOperatorNode(
    ts.SyntaxKind.ReadonlyKeyword,
    context.factory.updateTupleTypeNode(node, Ts),
  );
};

// Convert `{ member: X }` to a `Readonly<{ member: X }>`
const transformTypeLiteralNode = (
  node: ts.TypeLiteralNode,
  context: ts.TransformationContext,
): ts.TypeLiteralNode | ts.TypeReferenceNode => {
  const newTypeLiteralNode = context.factory.updateTypeLiteralNode(
    node,
    // Recursive processing
    transformMembers(node.members, 'remove', context),
  );

  {
    const parent = node.parent as ts.Node | undefined;

    // Skip if already of type `Readonly<{ member: X }>`
    if (
      parent !== undefined &&
      ts.isTypeReferenceNode(parent) &&
      parent.typeName.getText() === 'Readonly'
    ) {
      // skip if already readonly
      return newTypeLiteralNode;
    }
  }

  return createReadonlyTypeNode(newTypeLiteralNode, context);
};

// Making interface members readonly
const transformInterfaceDeclarationNode = (
  node: ts.InterfaceDeclaration,
  context: ts.TransformationContext,
): ts.InterfaceDeclaration =>
  context.factory.createInterfaceDeclaration(
    removeReadonlyFromModifiers(node.modifiers),
    node.name,
    node.typeParameters?.map((n) =>
      transformTypeParameterDeclaration(n, context),
    ),
    node.heritageClauses?.map((n) => transformHeritageClause(n, context)),
    transformMembers(node.members, 'add', context),
  );

const transformClassDeclarationNode = (
  node: ts.ClassDeclaration,
  context: ts.TransformationContext,
): ts.ClassDeclaration =>
  context.factory.createClassDeclaration(
    node.modifiers,
    node.name,
    node.typeParameters?.map((n) =>
      transformTypeParameterDeclaration(n, context),
    ),
    node.heritageClauses?.map((n) => transformHeritageClause(n, context)),
    node.members.map((mb: ts.ClassElement): ts.ClassElement => {
      if (ts.isPropertyDeclaration(mb)) {
        return context.factory.createPropertyDeclaration(
          addReadonlyToModifiers(mb.modifiers, context),
          mb.name,
          mb.questionToken,
          mapOptional(mb.type, (n) => transformNode(n, context)),
          mb.initializer,
        );
      }
      if (ts.isMethodDeclaration(mb)) {
        return context.factory.createMethodDeclaration(
          addReadonlyToModifiers(mb.modifiers, context),
          mb.asteriskToken,
          mb.name,
          mb.questionToken,
          mb.typeParameters?.map((n) =>
            transformTypeParameterDeclaration(n, context),
          ),
          mb.parameters.map((n) => transformParameterDeclaration(n, context)),
          mapOptional(mb.type, (n) => transformNode(n, context)),
          mb.body,
        );
      }
      if (ts.isConstructorDeclaration(mb)) {
        return context.factory.createConstructorDeclaration(
          mb.modifiers,
          mb.parameters.map((n) => transformParameterDeclaration(n, context)),
          mb.body,
        );
      }
      if (ts.isGetAccessorDeclaration(mb)) {
        return transformGetAccessorDeclaration(mb, 'add', context);
      }
      if (ts.isSetAccessorDeclaration(mb)) {
        return transformSetAccessorDeclaration(mb, 'add', context);
      }
      if (ts.isIndexSignatureDeclaration(mb)) {
        return transformIndexSignatureDeclaration(mb, 'add', context);
      }
      if (ts.isClassStaticBlockDeclaration(mb)) {
        return context.factory.createClassStaticBlockDeclaration(mb.body);
      }
      if (ts.isSemicolonClassElement(mb)) {
        return context.factory.createSemicolonClassElement();
      }
      throw new TypeError(`Unexpected type of node: ${ts.SyntaxKind[mb.kind]}`);
    }),
  );

const transformTypeReferenceNode = (
  node: ts.TypeReferenceNode,
  context: ts.TransformationContext,
): ts.TypeNode => {
  // Recursive processing
  const newTypeArguments =
    node.typeArguments?.map((n) => transformNode(n, context)) ?? [];

  console.debug(node.typeName);
  const typeName = node.typeName.getText();
  console.debug(node.typeName.getText());

  // Array<T> / ReadonlyArray<T> to readonly T[]
  if (typeName === 'Array' || typeName === 'ReadonlyArray') {
    if (!Arr.isArrayOfLength1(newTypeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${newTypeArguments.length}" for ${typeName}.`,
      );
    }

    return createReadonlyArrayTypeNode(newTypeArguments[0], context);
  }

  // Set<T> to ReadonlySet<T>
  if (typeName === 'Set') {
    if (!Arr.isArrayOfLength1(newTypeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${newTypeArguments.length}" for Set.`,
      );
    }

    return context.factory.createTypeReferenceNode(
      context.factory.createIdentifier('ReadonlySet'),
      newTypeArguments,
    );
  }

  // Map<T> to ReadonlyMap<T>
  if (typeName === 'Map') {
    if (!Arr.isArrayOfLength2(newTypeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${newTypeArguments.length}" for Map.`,
      );
    }

    return context.factory.createTypeReferenceNode(
      context.factory.createIdentifier('ReadonlyMap'),
      newTypeArguments,
    );
  }

  // remove unnecessary `Readonly` wrappers
  if (typeName === 'Readonly') {
    {
      if (!Arr.isArrayOfLength1(newTypeArguments)) {
        throw new Error(
          `Unexpected number of type arguments "${newTypeArguments.length}" for Readonly.`,
        );
      }
    }

    const T = newTypeArguments[0];

    // Readonly<readonly T[]> -> readonly T[]
    if (
      ts.isTypeOperatorNode(T) &&
      T.operator === ts.SyntaxKind.ReadonlyKeyword
    ) {
      return createReadonlyArrayTypeNode(T, context);
    }

    // Readonly<Readonly<T>> -> Readonly<T>
    if (ts.isTypeReferenceNode(T) && T.typeName.getText() === 'Readonly') {
      const typeArgs = T.typeArguments ?? [];
      if (!Arr.isArrayOfLength1(typeArgs)) {
        throw new Error(
          `Unexpected number of type arguments "${typeArgs.length}" for Readonly.`,
        );
      }
      return createReadonlyTypeNode(typeArgs[0], context);
    }
  }

  return context.factory.createTypeReferenceNode(
    node.typeName,
    newTypeArguments,
  );
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
  context: ts.TransformationContext,
): ts.MappedTypeNode | ts.TypeReferenceNode => {
  const newMappedTypeNode = context.factory.updateMappedTypeNode(
    node,
    undefined, // remove readonlyToken
    node.typeParameter,
    node.nameType,
    node.questionToken,
    mapOptional(node.type, (n) => transformNode(n, context)),
    node.members,
  );

  {
    const parent = node.parent as ts.Node | undefined;
    // Skip if already of type `Readonly<{ member: X }>`
    if (
      parent !== undefined &&
      ts.isTypeReferenceNode(parent) &&
      parent.typeName.getText() === 'Readonly'
    ) {
      // skip if already readonly
      return newMappedTypeNode;
    }
  }

  return createReadonlyTypeNode(newMappedTypeNode, context);
};

/** Readonly<A> & Readonly<B> -> Readonly<A & B> */
const transformIntersectionTypeNode = (
  node: ts.IntersectionTypeNode,
  context: ts.TransformationContext,
): ts.IntersectionTypeNode | ts.TypeReferenceNode => {
  // Recursive processing
  const newTypes = node.types.map((n) => transformNode(n, context));

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

    return createReadonlyTypeNode(
      context.factory.createIntersectionTypeNode(args),
      context,
    );
  }

  return context.factory.createIntersectionTypeNode(newTypes);
};

/** Readonly<A> | Readonly<B> -> Readonly<A | B> */
const transformUnionTypeNode = (
  node: ts.UnionTypeNode,
  context: ts.TransformationContext,
): ts.TypeNode => {
  // Recursive processing
  const newTypes = node.types.map((t) => transformNode(t, context));

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

    return createReadonlyTypeNode(
      context.factory.createUnionTypeNode(args),
      context,
    );
  }

  return context.factory.createUnionTypeNode(newTypes);
};

/** Convert ((T)) -> (T) recursively */
const transformParenthesizedTypeNode = (
  node: ts.ParenthesizedTypeNode,
  context: ts.TransformationContext,
): ts.TypeNode =>
  ts.isParenthesizedTypeNode(node.type)
    ? transformParenthesizedTypeNode(node.type, context)
    : node;

const transformPropertySignature = (
  node: ts.PropertySignature,
  readonly: 'add' | 'remove',
  context: ts.TransformationContext,
): ts.PropertySignature =>
  context.factory.createPropertySignature(
    match(readonly, {
      add: addReadonlyToModifiers(node.modifiers, context),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.name,
    node.questionToken,
    mapOptional(node.type, (t) => transformNode(t, context)),
  );

const transformIndexSignatureDeclaration = (
  node: ts.IndexSignatureDeclaration,
  readonly: 'add' | 'remove',
  context: ts.TransformationContext,
): ts.IndexSignatureDeclaration =>
  context.factory.createIndexSignature(
    match(readonly, {
      add: addReadonlyToModifiers(node.modifiers, context),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.parameters.map((n) => transformParameterDeclaration(n, context)),
    transformNode(node.type, context),
  );

const transformMethodSignature = (
  node: ts.MethodSignature,
  readonly: 'add' | 'remove',
  context: ts.TransformationContext,
): ts.MethodSignature =>
  context.factory.createMethodSignature(
    match(readonly, {
      add: addReadonlyToModifiers(node.modifiers, context),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.name,
    node.questionToken,
    node.typeParameters?.map((n) =>
      transformTypeParameterDeclaration(n, context),
    ),
    node.parameters.map((n) => transformParameterDeclaration(n, context)),
    mapOptional(node.type, (n) => transformNode(n, context)),
  );

const transformCallSignatureDeclaration = (
  node: ts.CallSignatureDeclaration,
  context: ts.TransformationContext,
): ts.CallSignatureDeclaration =>
  context.factory.createCallSignature(
    node.typeParameters?.map((n) =>
      transformTypeParameterDeclaration(n, context),
    ),
    node.parameters.map((n) => transformParameterDeclaration(n, context)),
    mapOptional(node.type, (n) => transformNode(n, context)),
  );

const transformConstructSignatureDeclaration = (
  node: ts.ConstructSignatureDeclaration,
  context: ts.TransformationContext,
): ts.ConstructSignatureDeclaration =>
  context.factory.createConstructSignature(
    node.typeParameters?.map((n) =>
      transformTypeParameterDeclaration(n, context),
    ),
    node.parameters.map((n) => transformParameterDeclaration(n, context)),
    mapOptional(node.type, (n) => transformNode(n, context)),
  );

const transformGetAccessorDeclaration = (
  node: ts.GetAccessorDeclaration,
  readonly: 'add' | 'remove',
  context: ts.TransformationContext,
): ts.GetAccessorDeclaration =>
  context.factory.createGetAccessorDeclaration(
    match(readonly, {
      add: addReadonlyToModifiers(node.modifiers, context),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.name,
    node.parameters.map((n) => transformParameterDeclaration(n, context)),
    mapOptional(node.type, (n) => transformNode(n, context)),
    node.body,
  );

const transformSetAccessorDeclaration = (
  node: ts.SetAccessorDeclaration,
  readonly: 'add' | 'remove',
  context: ts.TransformationContext,
): ts.SetAccessorDeclaration =>
  context.factory.createSetAccessorDeclaration(
    match(readonly, {
      add: addReadonlyToModifiers(node.modifiers, context),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.name,
    node.parameters.map((n) => transformParameterDeclaration(n, context)),
    node.body,
  );

const transformMembers = (
  members: ts.NodeArray<ts.TypeElement>,
  readonly: 'add' | 'remove',
  context: ts.TransformationContext,
): ts.NodeArray<ts.TypeElement> =>
  context.factory.createNodeArray(
    members.map((mb) => {
      if (ts.isPropertySignature(mb)) {
        return transformPropertySignature(mb, readonly, context);
      }
      if (ts.isIndexSignatureDeclaration(mb)) {
        return transformIndexSignatureDeclaration(mb, readonly, context);
      }
      if (ts.isMethodSignature(mb)) {
        return transformMethodSignature(mb, readonly, context);
      }
      if (ts.isCallSignatureDeclaration(mb)) {
        return transformCallSignatureDeclaration(mb, context);
      }
      if (ts.isConstructSignatureDeclaration(mb)) {
        return transformConstructSignatureDeclaration(mb, context);
      }
      if (ts.isGetAccessorDeclaration(mb)) {
        return transformGetAccessorDeclaration(mb, readonly, context);
      }
      if (ts.isSetAccessorDeclaration(mb)) {
        return transformSetAccessorDeclaration(mb, readonly, context);
      }
      throw new TypeError(`Unexpected type of node: ${ts.SyntaxKind[mb.kind]}`);
    }),
    members.hasTrailingComma,
  );

const transformTypeParameterDeclaration = (
  tp: ts.TypeParameterDeclaration,
  context: ts.TransformationContext,
): ts.TypeParameterDeclaration =>
  context.factory.createTypeParameterDeclaration(
    tp.modifiers,
    tp.name,
    mapOptional(tp.constraint, (n) => transformNode(n, context)),
    mapOptional(tp.default, (n) => transformNode(n, context)),
  );

const transformParameterDeclaration = (
  p: ts.ParameterDeclaration,
  context: ts.TransformationContext,
): ts.ParameterDeclaration =>
  context.factory.createParameterDeclaration(
    removeReadonlyFromModifiers(p.modifiers),
    p.dotDotDotToken,
    p.name,
    p.questionToken,
    mapOptional(p.type, (n) => transformNode(n, context)),
    p.initializer,
  );

const transformHeritageClause = (
  hc: ts.HeritageClause,
  context: ts.TransformationContext,
): ts.HeritageClause =>
  context.factory.createHeritageClause(
    hc.token,
    hc.types.map((t) =>
      context.factory.createExpressionWithTypeArguments(
        t.expression,
        t.typeArguments?.map((n) => transformNode(n, context)),
      ),
    ),
  );

const removeReadonlyFromModifiers = <M extends ts.ModifierLike>(
  modifiers: ts.NodeArray<M> | undefined,
): readonly M[] | undefined =>
  modifiers?.filter((m) => !ts.isReadonlyKeywordOrPlusOrMinusToken(m));

const addReadonlyToModifiers = <M extends ts.ModifierLike>(
  modifiers: ts.NodeArray<M> | undefined,
  context: ts.TransformationContext,
): readonly (M | ts.ReadonlyKeyword)[] | undefined =>
  mapOptional(modifiers, (ms) => [
    ...ms.filter((m) => !ts.isReadonlyKeywordOrPlusOrMinusToken(m)),
    context.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
  ]);

const createReadonlyTypeNode = (
  t: ts.TypeNode,
  context: ts.TransformationContext,
): ts.TypeReferenceNode =>
  context.factory.createTypeReferenceNode(
    context.factory.createIdentifier('Readonly'),
    [t],
  );

const createReadonlyArrayTypeNode = (
  t: ts.TypeNode,
  context: ts.TransformationContext,
): ts.TypeOperatorNode =>
  context.factory.createTypeOperatorNode(
    ts.SyntaxKind.ReadonlyKeyword,
    context.factory.createArrayTypeNode(t),
  );
