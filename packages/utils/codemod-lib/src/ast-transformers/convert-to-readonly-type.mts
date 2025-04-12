/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { Arr, expectType, mapOptional, strictMatch } from '@noshiro/ts-utils';
import * as ts from 'typescript';
import {
  createReadonlyArrayTypeNode,
  createReadonlyTupleTypeNode,
  createReadonlyTypeNode,
  isPrimitiveTypeNode,
  isReadonlyArrayTypeNode,
  isReadonlyTupleTypeNode,
  isReadonlyTypeNode,
  isSpreadNamedTupleMemberNode,
  isSpreadParameterNode,
} from '../functions/index.mjs';
import { createTransformerFactory, printNode } from '../utils/index.mjs';

/**
 * Convert all types to readonly.
 *
 * - Mutable to readonly
 *
 *   - A
 * - Normalize
 *
 *   - `Readonly<Readonly<T>>` to `Readonly<T>`
 *   - `Readonly<T[]>` to `readonly T[]`
 *   - `Readonly<readonly T[]>` to `readonly T[]`
 *   - `Readonly<[T1, T2, T3]>` to `readonly [T1, T2, T3]`
 *   - `Readonly<readonly [T1, T2, T3]>` to `readonly [T1, T2, T3]`
 *   - `ReadonlyArray<T>` to `readonly T[]`
 *   - `ReadonlyArray<T>` to `readonly T[]`
 *   - `Readonly<A> & Readonly<B>` to `Readonly<A & B>`
 *   - `Readonly<A> | Readonly<B>` to `Readonly<A | B>`
 */
export const convertToReadonlyType: ts.TransformerFactory<ts.SourceFile> =
  createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> =>
      transformNode(node, visitor, context);

    return visitor;
  });

type TransformNodeFn = <N extends ts.Node>(
  node: N,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  /**
   * `readonly [string, ...number[]]` の内側の `number[]` からは readonly
   * を省いた形に統一するために、 変換の再帰呼び出し時にその階層をmutable にするかどうかを制御する。
   *
   * - `"deep"` : 再帰的に readonly を適用する `DeepReadonly` などの型ユーティリティの内部のノードであることを表す。
   * - `"shallow"` : 通常の `Readonly` や `readonly` などの直下のノードであることを表す。
   * - `"none"` : それ以外
   */
  // readonlyContext: 'deep' | 'shallow' | 'none',
) => N extends ts.ArrayTypeNode | ts.TupleTypeNode
  ? N | ts.TypeOperatorNode
  : N extends ts.TypeLiteralNode
    ? N | ts.TypeReferenceNode
    : N extends ts.TypeReferenceNode
      ? N | ts.TypeNode
      : N extends ts.MappedTypeNode
        ? N | ts.TypeReferenceNode
        : N extends ts.IntersectionTypeNode
          ? N | ts.TypeReferenceNode
          : N extends ts.UnionTypeNode
            ? N | ts.TypeNode
            : N extends ts.ParenthesizedTypeNode
              ? N | ts.TypeNode
              : N extends ts.TypeOperatorNode
                ? N | ts.TypeNode
                : N;

/** Convert all nodes to readonly type (recursively) */
// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const transformNode: TransformNodeFn = ((node, visitor, context) => {
  console.debug(
    `[${ts.SyntaxKind[node.kind]}]:\t`,
    printNode(node, node.getSourceFile()),
    // `readonlyContext: ${readonlyContext}`,
  );

  if (ts.isTypeReferenceNode(node)) {
    return transformTypeReferenceNode(node, visitor, context);
  }
  if (ts.isTypeLiteralNode(node)) {
    return transformTypeLiteralNode(node, visitor, context);
  }
  if (ts.isMappedTypeNode(node)) {
    return transformMappedTypeNode(node, visitor, context);
  }
  if (ts.isInterfaceDeclaration(node)) {
    return transformInterfaceDeclarationNode(node, visitor, context);
  }
  if (ts.isClassDeclaration(node)) {
    return transformClassDeclarationNode(node, visitor, context);
  }
  if (ts.isArrayTypeNode(node)) {
    return transformArrayTypeNode(node, visitor, context);
  }
  if (ts.isTupleTypeNode(node)) {
    return transformTupleTypeNode(node, visitor, context);
  }
  if (ts.isRestTypeNode(node)) {
    return transformRestTypeNode(node, visitor, context);
  }
  if (ts.isTypeOperatorNode(node)) {
    return transformTypeOperatorNode(node, visitor, context);
  }
  if (ts.isIntersectionTypeNode(node)) {
    return transformIntersectionTypeNode(node, visitor, context);
  }
  if (ts.isUnionTypeNode(node)) {
    return transformUnionTypeNode(node, visitor, context);
  }
  if (ts.isParenthesizedTypeNode(node)) {
    return transformParenthesizedTypeNode(node, visitor, context);
  }

  return ts.visitEachChild(node, visitor, context);
}) as TransformNodeFn;

/** `E[]` -> `readonly E[]` */
const transformArrayTypeNode = (
  node: ts.ArrayTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.ArrayTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const E = transformNode(node.elementType, visitor, context);

  {
    const parent = node.parent as ts.Node | undefined;

    if (
      parent !== undefined &&
      ts.isTypeOperatorNode(parent) &&
      parent.operator === ts.SyntaxKind.ReadonlyKeyword
    ) {
      // skip if already readonly
      // `E[]`
      return context.factory.createArrayTypeNode(E);
    }
  }

  // `readonly E[]`
  return context.factory.createTypeOperatorNode(
    ts.SyntaxKind.ReadonlyKeyword,
    context.factory.updateArrayTypeNode(node, E),
  );
};

/** `[E1, E2, E3]` -> `readonly [E1, E2, E3]` */
const transformTupleTypeNode = (
  node: ts.TupleTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.TupleTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const Es = node.elements.map((el) =>
    ts.isNamedTupleMember(el)
      ? context.factory.updateNamedTupleMember(
          el,
          undefined,
          el.name,
          undefined,
          transformNode(el.type, visitor, context),
        )
      : transformNode(el, visitor, context),
  );

  {
    const parent = node.parent as ts.Node | undefined;

    if (
      parent !== undefined &&
      ts.isTypeOperatorNode(parent) &&
      parent.operator === ts.SyntaxKind.ReadonlyKeyword
    ) {
      // skip if already readonly
      // `[E1, E2, E3]`
      return context.factory.createTupleTypeNode(Es);
    }
  }

  // `readonly [E1, E2, E3]`
  return context.factory.createTypeOperatorNode(
    ts.SyntaxKind.ReadonlyKeyword,
    context.factory.updateTupleTypeNode(node, Es),
  );
};

// `...readonly E[]` -> `...E[]`
const transformRestTypeNode = (
  node: ts.RestTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.RestTypeNode => {
  // Recursive processing
  const T = transformNode(node.type, visitor, context);

  if (isReadonlyArrayTypeNode(T) || isReadonlyTupleTypeNode(T)) {
    return context.factory.updateRestTypeNode(node, T.type);
  }

  return context.factory.updateRestTypeNode(node, T);
};

// `{ member: V }` -> `Readonly<{ member: V }>`
const transformTypeLiteralNode = (
  node: ts.TypeLiteralNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.TypeLiteralNode | ts.TypeReferenceNode => {
  const newTypeLiteralNode = context.factory.updateTypeLiteralNode(
    node,
    // Recursive processing
    transformMembers(node.members, 'remove', visitor, context),
  );

  {
    const parent = node.parent as ts.Node | undefined;

    // Skip if already of type `Readonly<{ member: V }>`
    if (parent !== undefined && isReadonlyTypeNode(parent)) {
      // skip if already readonly
      // `{ member: V }`
      return newTypeLiteralNode;
    }
  }

  // `Readonly<{ member: V }>`
  return createReadonlyTypeNode(newTypeLiteralNode, context);
};

// Making interface members readonly
const transformInterfaceDeclarationNode = (
  node: ts.InterfaceDeclaration,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.InterfaceDeclaration =>
  context.factory.updateInterfaceDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters?.map((n) => transformNode(n, visitor, context)),
    node.heritageClauses?.map((n) => transformNode(n, visitor, context)),
    transformMembers(node.members, 'add', visitor, context),
  );

const transformClassDeclarationNode = (
  node: ts.ClassDeclaration,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.ClassDeclaration =>
  context.factory.updateClassDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters?.map((n) => transformNode(n, visitor, context)),
    node.heritageClauses?.map((n) => transformNode(n, visitor, context)),
    node.members.map((mb: ts.ClassElement): ts.ClassElement => {
      console.debug(
        `transformClassDeclarationNode [${ts.SyntaxKind[mb.kind]}]`,
        printNode(mb, mb.getSourceFile()),
      );

      if (ts.isPropertyDeclaration(mb)) {
        return context.factory.updatePropertyDeclaration(
          mb,
          addReadonlyToModifiers(mb.modifiers, context),
          mb.name,
          mb.questionToken,
          mapOptional(mb.type, (n) => transformNode(n, visitor, context)),
          mb.initializer,
        );
      }
      if (ts.isIndexSignatureDeclaration(mb)) {
        return transformIndexSignatureDeclaration(mb, 'add', visitor, context);
      }
      if (ts.isConstructorDeclaration(mb)) {
        return context.factory.updateConstructorDeclaration(
          mb,
          mb.modifiers,
          mb.parameters.map((n) =>
            context.factory.updateParameterDeclaration(
              n,
              addReadonlyToModifiers(n.modifiers, context),
              n.dotDotDotToken,
              n.name,
              n.questionToken,
              mapOptional(n.type, (t) => transformNode(t, visitor, context)),
              n.initializer,
            ),
          ),
          mapOptional(mb.body, (body) =>
            ts.visitEachChild(body, visitor, context),
          ),
        );
      }

      return transformNode(mb, visitor, context);
    }),
  );

const transformTypeReferenceNode = (
  node: ts.TypeReferenceNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.TypeNode => {
  // Recursive processing
  const newTypeArguments = context.factory.createNodeArray(
    node.typeArguments?.map((n) =>
      removeParentheses(transformNode(n, visitor, context)),
    ) ?? [],
  );

  expectType<
    typeof node.typeName.kind,
    ts.SyntaxKind.Identifier | ts.SyntaxKind.QualifiedName
  >('=');

  if (node.typeName.kind === ts.SyntaxKind.QualifiedName) {
    return context.factory.updateTypeReferenceNode(
      node,
      node.typeName,
      newTypeArguments,
    );
  }

  const typeNameStr = node.typeName.text;

  // Array<T> / ReadonlyArray<T> to readonly T[]
  if (typeNameStr === 'Array' || typeNameStr === 'ReadonlyArray') {
    if (!Arr.isArrayOfLength1(newTypeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${newTypeArguments.length}" for ${typeNameStr}.`,
      );
    }

    return createReadonlyArrayTypeNode(newTypeArguments[0], context);
  }

  // Set<T> to ReadonlySet<T>
  if (typeNameStr === 'Set') {
    if (!Arr.isArrayOfLength1(newTypeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${newTypeArguments.length}" for Set.`,
      );
    }

    return context.factory.updateTypeReferenceNode(
      node,
      context.factory.createIdentifier('ReadonlySet'),
      newTypeArguments,
    );
  }

  // Map<T> to ReadonlyMap<T>
  if (typeNameStr === 'Map') {
    if (!Arr.isArrayOfLength2(newTypeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${newTypeArguments.length}" for Map.`,
      );
    }

    return context.factory.updateTypeReferenceNode(
      node,
      context.factory.createIdentifier('ReadonlyMap'),
      newTypeArguments,
    );
  }

  // remove unnecessary `Readonly` wrappers
  if (typeNameStr === 'Readonly') {
    if (!Arr.isArrayOfLength1(newTypeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${newTypeArguments.length}" for Readonly.`,
      );
    }

    const T = newTypeArguments[0];

    // T = E[]
    // Readonly<E[]> -> readonly E[]
    if (ts.isArrayTypeNode(T)) {
      return createReadonlyArrayTypeNode(T.elementType, context);
    }

    // T = [E1, E2, E3]
    // Readonly<[E1, E2, E3]> -> readonly [E1, E2, E3]
    if (ts.isTupleTypeNode(T)) {
      return createReadonlyTupleTypeNode(T.elements, context);
    }

    // T = readonly E[]
    // Readonly<readonly E[]> -> readonly E[]
    // Readonly<readonly [E1, E2, E3]> -> readonly [E1, E2, E3]
    if (isReadonlyArrayTypeNode(T) || isReadonlyTupleTypeNode(T)) {
      return T;
    }

    // T = Readonly<E>
    // Readonly<Readonly<E>> -> Readonly<E>
    if (isReadonlyTypeNode(T)) {
      return T;
    }

    // T = A | B | C
    if (ts.isUnionTypeNode(T)) {
      // T = readonly A[] | Readonly<B>
      // Readonly<readonly A[] | Readonly<B>> -> readonly A[] | Readonly<B>
      if (
        T.types.every(
          (t) => isReadonlyArrayTypeNode(t) || isReadonlyTypeNode(t),
        )
      ) {
        return T;
      }

      return createReadonlyTypeNode(T, context);
    }
    // T = A & B & C
    if (ts.isIntersectionTypeNode(T)) {
      // T = readonly A[] & Readonly<B>
      // Readonly<readonly A[] & Readonly<B>> -> readonly A[] & Readonly<B>
      if (
        T.types.every(
          (t) => isReadonlyArrayTypeNode(t) || isReadonlyTypeNode(t),
        )
      ) {
        return T;
      }

      return createReadonlyTypeNode(T, context);
    }

    if (isPrimitiveTypeNode(T)) {
      return T;
    }
  }

  return context.factory.updateTypeReferenceNode(
    node,
    node.typeName,
    newTypeArguments,
  );
};

/**
 * - `{ [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 * - `{ -readonly [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 * - `{ readonly [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 * - `{ +readonly [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 */
const transformMappedTypeNode = (
  node: ts.MappedTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.MappedTypeNode | ts.TypeReferenceNode => {
  const newMappedTypeNode = context.factory.updateMappedTypeNode(
    node,
    undefined, // remove readonlyToken
    node.typeParameter,
    node.nameType,
    node.questionToken,
    mapOptional(node.type, (n) => transformNode(n, visitor, context)),
    node.members,
  );

  {
    const parent = node.parent as ts.Node | undefined;
    // Skip if already of type `Readonly<{ member: X }>`
    if (parent !== undefined && isReadonlyTypeNode(parent)) {
      // skip if already readonly
      return newMappedTypeNode;
    }
  }

  return createReadonlyTypeNode(newMappedTypeNode, context);
};

/** `Readonly<A> & Readonly<B>` -> `Readonly<A & B>` */
const transformIntersectionTypeNode = (
  node: ts.IntersectionTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.IntersectionTypeNode | ts.TypeReferenceNode => {
  // Recursive processing
  const newTypes = context.factory.createNodeArray(
    node.types.map((n) => transformNode(n, visitor, context)),
  );

  console.debug(
    'intersection converted',
    newTypes.map((n) => printNode(n, node.getSourceFile())),
  );

  if (newTypes.every(isReadonlyTypeNode)) {
    // Readonly<*> & ... & Readonly<*>
    const args = context.factory.createNodeArray(
      newTypes.map(
        (type) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, total-functions/no-unsafe-type-assertion
          (type as Required<ts.TypeReferenceNode>).typeArguments[0]!,
      ),
    );

    return createReadonlyTypeNode(
      context.factory.updateIntersectionTypeNode(node, args),
      context,
    );
  }

  return context.factory.updateIntersectionTypeNode(node, newTypes);
};

/** `Readonly<A> | Readonly<B>` -> `Readonly<A | B>` */
const transformUnionTypeNode = (
  node: ts.UnionTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.UnionTypeNode | ts.TypeReferenceNode => {
  // Recursive processing
  const newTypes = context.factory.createNodeArray(
    node.types.map((n) => transformNode(n, visitor, context)),
  );
  console.debug(
    'union converted',
    newTypes.map((n) => printNode(n, node.getSourceFile())),
  );

  if (newTypes.every(isReadonlyTypeNode)) {
    // Readonly<*> | ... | Readonly<*>
    const args = context.factory.createNodeArray(
      newTypes.map(
        (type) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, total-functions/no-unsafe-type-assertion
          (type as Required<ts.TypeReferenceNode>).typeArguments[0]!,
      ),
    );
    return createReadonlyTypeNode(
      context.factory.updateUnionTypeNode(node, args),
      context,
    );
  }

  return context.factory.updateUnionTypeNode(node, newTypes);
};

/**
 * - `readonly T[][]` -> `readonly (readonly T[])[]`
 * - `keyof { a: number[] }` -> `keyof Readonly<{ a: readonly number[] }>`
 */
const transformTypeOperatorNode = (
  node: ts.TypeOperatorNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.TypeNode => {
  if (isReadonlyArrayTypeNode(node)) {
    const parent = node.parent as ts.Node | undefined;

    const E = transformNode(node.type.elementType, visitor, context);

    if (
      parent !== undefined &&
      // `(...args: readonly E[]) => any` -> `(...args: E[]) => any`
      (isSpreadParameterNode(parent) ||
        // `[name: E0, ...args: readonly E[])]` -> `[name: E0, ...args: E[]]`
        isSpreadNamedTupleMemberNode(parent))
    ) {
      return context.factory.createArrayTypeNode(E);
    }
  }

  // Recursive processing
  const newType = transformNode(node.type, visitor, context);

  return context.factory.updateTypeOperatorNode(node, newType);
};

/** Convert ((T)) -> (T) recursively */
const transformParenthesizedTypeNode = (
  node: ts.ParenthesizedTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.TypeNode => {
  if (ts.isParenthesizedTypeNode(node.type)) {
    // Recursive processing
    return transformParenthesizedTypeNode(node.type, visitor, context);
  }

  const T = transformNode(node.type, visitor, context);

  // remove () if T is TypeReferenceNode
  // e.g. `(Readonly<A>)` -> `Readonly<A>`
  if (ts.isTypeReferenceNode(T)) return T;

  // remove () if T is TypeOperatorNode
  // e.g. `(readonly A[])` -> `readonly A[]`
  if (ts.isTypeOperatorNode(T)) return T;

  // remove () if T is ArrayTypeNode
  // e.g. `(A[])` -> `A[]`
  if (ts.isArrayTypeNode(T)) return T;

  // remove () if T is TupleTypeNode
  // e.g. `([A])` -> `[A]`
  if (ts.isTupleTypeNode(T)) return T;

  if (isPrimitiveTypeNode(T)) return T;

  // remove () if T is TypeLiteralNode
  // e.g. `({ member: V })` -> `{ member: V }`
  if (ts.isTypeLiteralNode(T)) return T;

  // otherwise, keep ()
  return context.factory.updateParenthesizedType(node, T);
};

const removeParentheses = (node: ts.TypeNode): ts.TypeNode =>
  ts.isParenthesizedTypeNode(node) ? node.type : node;

const transformMembers = (
  members: ts.NodeArray<ts.TypeElement>,
  readonly: 'add' | 'remove',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.NodeArray<ts.TypeElement> =>
  context.factory.createNodeArray(
    members.map((mb) => {
      console.debug(
        `transformMembers [${ts.SyntaxKind[mb.kind]}]`,
        printNode(mb, mb.getSourceFile()),
      );
      if (ts.isPropertySignature(mb)) {
        return transformPropertySignature(mb, readonly, visitor, context);
      }
      if (ts.isIndexSignatureDeclaration(mb)) {
        return transformIndexSignatureDeclaration(
          mb,
          readonly,
          visitor,
          context,
        );
      }

      return transformNode(mb, visitor, context);
    }),
    members.hasTrailingComma,
  );

const transformPropertySignature = (
  node: ts.PropertySignature,
  readonly: 'add' | 'remove',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.PropertySignature =>
  context.factory.updatePropertySignature(
    node,
    strictMatch(readonly, {
      add: addReadonlyToModifiers(node.modifiers, context),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.name,
    node.questionToken,
    mapOptional(node.type, (t) => transformNode(t, visitor, context)),
  );

const transformIndexSignatureDeclaration = (
  node: ts.IndexSignatureDeclaration,
  readonly: 'add' | 'remove',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.IndexSignatureDeclaration =>
  context.factory.updateIndexSignature(
    node,
    strictMatch(readonly, {
      add: addReadonlyToModifiers(node.modifiers, context),
      remove: removeReadonlyFromModifiers(node.modifiers),
    }),
    node.parameters.map((n) => transformNode(n, visitor, context)),
    transformNode(node.type, visitor, context),
  );

const removeReadonlyFromModifiers = <M extends ts.ModifierLike>(
  modifiers: ts.NodeArray<M> | undefined,
): readonly M[] | undefined =>
  modifiers?.filter((m) => !ts.isReadonlyKeywordOrPlusOrMinusToken(m));

const addReadonlyToModifiers = <M extends ts.ModifierLike>(
  modifiers: ts.NodeArray<M> | undefined,
  context: ts.TransformationContext,
): readonly (M | ts.ReadonlyKeyword)[] => [
  ...(modifiers ?? []).filter(
    (m) => !ts.isReadonlyKeywordOrPlusOrMinusToken(m),
  ),
  context.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
];
