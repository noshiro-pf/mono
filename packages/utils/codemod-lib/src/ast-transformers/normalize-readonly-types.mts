/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { Arr, expectType, mapOptional, strictMatch } from '@noshiro/ts-utils';
import * as ts from 'typescript';
import {
  createReadonlyArrayTypeNode,
  createReadonlyTupleTypeNode,
  createReadonlyTypeNode,
  isPrimitiveTypeNode,
  isReadonlyArrayNode,
  isReadonlyNode,
  isReadonlyTupleNode,
  isSpreadNamedTupleMemberNode,
  isSpreadParameterNode,
} from '../functions/index.mjs';
import { createTransformerFactory, printNode } from '../utils/index.mjs';

/**
 * Normalize Readonly types.
 *
 * - `Readonly<Readonly<T>>` to `Readonly<T>`
 * - `Readonly<T[]>` to `readonly T[]`
 * - `Readonly<readonly T[]>` to `readonly T[]`
 * - `Readonly<[T1, T2, T3]>` to `readonly [T1, T2, T3]`
 * - `Readonly<readonly [T1, T2, T3]>` to `readonly [T1, T2, T3]`
 * - `ReadonlyArray<T>` to `readonly T[]`
 * - `ReadonlyArray<T>` to `readonly T[]`
 * - `Readonly<A> & Readonly<B>` to `Readonly<A & B>`
 * - `Readonly<A> | Readonly<B>` to `Readonly<A | B>`
 * - `(...args: readonly T[]) => any` to `(...args: T[]) => any`
 */
export const normalizeReadonlyTypes: ts.TransformerFactory<ts.SourceFile> =
  createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> =>
      transformNode(node, visitor, context);

    return visitor;
  });

type TransformNodeFn = <N extends ts.Node>(
  node: N,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
) => N extends ts.TypeLiteralNode
  ? N | ts.TypeReferenceNode
  : N extends ts.TypeReferenceNode
    ? N | ts.TypeNode
    : N extends ts.IntersectionTypeNode
      ? N | ts.TypeReferenceNode
      : N extends ts.UnionTypeNode
        ? N | ts.TypeNode
        : N extends ts.ParenthesizedTypeNode
          ? N | ts.TypeNode
          : N;

/** Convert all nodes to readonly type (recursively) */
// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const transformNode: TransformNodeFn = ((node, visitor, context) => {
  console.debug(
    `[${ts.SyntaxKind[node.kind]}]:\t`,
    printNode(node, node.getSourceFile()),
  );

  if (ts.isTypeLiteralNode(node)) {
    return transformTypeLiteralNode(node, visitor, context);
  }
  if (ts.isTypeReferenceNode(node)) {
    return transformTypeReferenceNode(node, visitor, context);
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

// `{ readonly member: V }` -> `Readonly<{ member: V }>`
const transformTypeLiteralNode = (
  node: ts.TypeLiteralNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.TypeLiteralNode | ts.TypeReferenceNode => {
  const allMembersAreReadonly: boolean = node.members
    .filter(
      (mb) => ts.isPropertySignature(mb) || ts.isIndexSignatureDeclaration(mb),
    )
    .every(
      (mb) =>
        mb.modifiers?.some((m) => m.kind === ts.SyntaxKind.ReadonlyKeyword) ??
        false,
    );

  const newTypeLiteralNode = context.factory.updateTypeLiteralNode(
    node,
    // Recursive processing
    transformMembers(
      node.members,
      allMembersAreReadonly ? 'remove' : 'keep',
      visitor,
      context,
    ),
  );

  if (!allMembersAreReadonly) return newTypeLiteralNode;

  {
    const parent = node.parent as ts.Node | undefined;

    // Skip if already of type `Readonly<{ member: V }>`
    if (parent !== undefined && isReadonlyNode(parent)) {
      // skip if already readonly
      // `{ member: V }`
      return newTypeLiteralNode;
    }
  }

  // `Readonly<{ member: V }>`
  return createReadonlyTypeNode(newTypeLiteralNode, context);
};

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

  // ReadonlyArray<T> to readonly T[]
  if (typeNameStr === 'ReadonlyArray') {
    if (!Arr.isArrayOfLength1(newTypeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${newTypeArguments.length}" for ${typeNameStr}.`,
      );
    }

    const T = newTypeArguments[0];

    const parent = node.parent as ts.Node | undefined;

    if (
      parent !== undefined &&
      // `(...args: any) => any` -> `(...args: unknown[]) => any`
      (isSpreadParameterNode(parent) ||
        // `[name: E0, ...args: any)]` -> `[name: E0, ...args:
        isSpreadNamedTupleMemberNode(parent))
    ) {
      return context.factory.createArrayTypeNode(T);
    }

    return createReadonlyArrayTypeNode(T, context);
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
    if (isReadonlyArrayNode(T) || isReadonlyTupleNode(T)) {
      return T;
    }

    // T = Readonly<E>
    // Readonly<Readonly<E>> -> Readonly<E>
    if (isReadonlyNode(T)) {
      return T;
    }

    // T = A | B | C
    if (ts.isUnionTypeNode(T)) {
      // T = readonly A[] | Readonly<B>
      // Readonly<readonly A[] | Readonly<B>> -> readonly A[] | Readonly<B>
      if (T.types.every((t) => isReadonlyArrayNode(t) || isReadonlyNode(t))) {
        return T;
      }

      return createReadonlyTypeNode(T, context);
    }
    // T = A & B & C
    if (ts.isIntersectionTypeNode(T)) {
      // T = readonly A[] & Readonly<B>
      // Readonly<readonly A[] & Readonly<B>> -> readonly A[] & Readonly<B>
      if (T.types.every((t) => isReadonlyArrayNode(t) || isReadonlyNode(t))) {
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

  if (newTypes.every(isReadonlyNode)) {
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

  if (newTypes.every(isReadonlyNode)) {
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
  readonly: 'remove' | 'keep',
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
  readonly: 'remove' | 'keep',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.PropertySignature =>
  context.factory.updatePropertySignature(
    node,
    strictMatch(readonly, {
      remove: removeReadonlyFromModifiers(node.modifiers),
      keep: node.modifiers,
    }),
    node.name,
    node.questionToken,
    mapOptional(node.type, (t) => transformNode(t, visitor, context)),
  );

const transformIndexSignatureDeclaration = (
  node: ts.IndexSignatureDeclaration,
  readonly: 'remove' | 'keep',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.IndexSignatureDeclaration =>
  context.factory.updateIndexSignature(
    node,
    strictMatch(readonly, {
      remove: removeReadonlyFromModifiers(node.modifiers),
      keep: node.modifiers,
    }),
    node.parameters.map((n) => transformNode(n, visitor, context)),
    transformNode(node.type, visitor, context),
  );

const removeReadonlyFromModifiers = <M extends ts.ModifierLike>(
  modifiers: ts.NodeArray<M> | undefined,
): readonly M[] | undefined =>
  modifiers?.filter((m) => !ts.isReadonlyKeywordOrPlusOrMinusToken(m));
