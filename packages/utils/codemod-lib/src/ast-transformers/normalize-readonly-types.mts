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
  isReadonlyTupleOrArrayNode,
  nextReadonlyContext,
  ReadonlyContext,
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
 */
export const normalizeReadonlyTypes: ts.TransformerFactory<ts.SourceFile> =
  createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> =>
      transformNode(node, visitor, context, 'none');

    return visitor;
  });

type TransformNodeFn = <N extends ts.Node>(
  node: N,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
) => N extends ts.ArrayTypeNode | ts.TupleTypeNode
  ? N | ts.TypeOperatorNode
  : N extends ts.TypeLiteralNode
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
const transformNode: TransformNodeFn = ((
  node,
  visitor,
  context,
  readonlyContext,
) => {
  console.debug(
    `[${ts.SyntaxKind[node.kind]}]:\t`,
    printNode(node, node.getSourceFile()),
  );

  if (ts.isTypeReferenceNode(node)) {
    return transformTypeReferenceNode(node, visitor, context, readonlyContext);
  }
  if (ts.isTypeLiteralNode(node)) {
    return transformTypeLiteralNode(node, visitor, context, readonlyContext);
  }
  if (ts.isArrayTypeNode(node)) {
    return transformArrayTypeNode(node, visitor, context, readonlyContext);
  }
  if (ts.isTupleTypeNode(node)) {
    return transformTupleTypeNode(node, visitor, context, readonlyContext);
  }
  if (ts.isRestTypeNode(node)) {
    return transformRestTypeNode(node, visitor, context, readonlyContext);
  }
  if (ts.isIntersectionTypeNode(node)) {
    return transformIntersectionTypeNode(
      node,
      visitor,
      context,
      readonlyContext,
    );
  }
  if (ts.isUnionTypeNode(node)) {
    return transformUnionTypeNode(node, visitor, context, readonlyContext);
  }
  if (ts.isParenthesizedTypeNode(node)) {
    return transformParenthesizedTypeNode(
      node,
      visitor,
      context,
      readonlyContext,
    );
  }

  return ts.visitEachChild(node, visitor, context);
}) as TransformNodeFn;

// `{ readonly member: V }` -> `Readonly<{ member: V }>`
const transformTypeLiteralNode = (
  node: ts.TypeLiteralNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<ReadonlyContext, 'readonly'>,
): ts.TypeLiteralNode | ts.TypeReferenceNode => {
  switch (readonlyContext) {
    case 'DeepReadonly':
    case 'Readonly':
      return context.factory.updateTypeLiteralNode(
        node,
        // Recursive processing
        transformMembers(
          node.members,
          'remove',
          visitor,
          context,
          nextReadonlyContext(readonlyContext, 'none'),
        ),
      );

    case 'none': {
      const allMembersAreReadonly: boolean = node.members
        .filter(
          (mb) =>
            ts.isPropertySignature(mb) || ts.isIndexSignatureDeclaration(mb),
        )
        .every(
          (mb) =>
            mb.modifiers?.some(
              (m) => m.kind === ts.SyntaxKind.ReadonlyKeyword,
            ) ?? false,
        );

      return allMembersAreReadonly
        ? // `{ readonly x: X, readonly y: Y }` -> `Readonly<{ x: X, y: Y }>`
          createReadonlyTypeNode(
            context.factory.updateTypeLiteralNode(
              node,
              // Recursive processing
              transformMembers(
                node.members,
                'remove',
                visitor,
                context,
                nextReadonlyContext(readonlyContext, 'none'),
              ),
            ),
            context,
          )
        : //    `{ readonly x: number, y: ReadonlyArray<number> }`
          // -> `{ readonly x: number, y: readonly number[] }`
          context.factory.updateTypeLiteralNode(
            node,
            // Recursive processing
            transformMembers(
              node.members,
              'keep',
              visitor,
              context,
              nextReadonlyContext(readonlyContext, 'none'),
            ),
          );
    }
  }
};

const transformTypeReferenceNode = (
  node: ts.TypeReferenceNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: 'DeepReadonly' | 'Readonly' | 'none',
): ts.TypeNode => {
  expectType<
    typeof node.typeName.kind,
    ts.SyntaxKind.Identifier | ts.SyntaxKind.QualifiedName
  >('=');

  if (node.typeName.kind === ts.SyntaxKind.Identifier) {
    const typeArguments =
      node.typeArguments ?? context.factory.createNodeArray([]);

    const typeNameStr = node.typeName.text;

    // ReadonlyArray<T> to readonly T[]
    if (typeNameStr === 'ReadonlyArray') {
      if (!Arr.isArrayOfLength1(typeArguments)) {
        throw new Error(
          `Unexpected number of type arguments "${typeArguments.length}" for ${typeNameStr}.`,
        );
      }

      // Recursive processing
      const T = transformNode(typeArguments[0], visitor, context, 'none');

      return createReadonlyArrayTypeNode(T, context);
    }

    // remove unnecessary `Readonly` wrappers
    if (typeNameStr === 'Readonly') {
      if (!Arr.isArrayOfLength1(typeArguments)) {
        throw new Error(
          `Unexpected number of type arguments "${typeArguments.length}" for Readonly.`,
        );
      }

      // Recursive processing
      const T = transformNode(typeArguments[0], visitor, context, 'shallow');

      // Readonly<Readonly<T>> -> Readonly<T>
      if (readonlyContext === 'shallow' || readonlyContext === 'deep') {
        return T;
      }

      // Readonly<number> -> number
      if (isPrimitiveTypeNode(T)) {
        return T;
      }

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
      if (isReadonlyTupleOrArrayNode(T)) {
        return T;
      }

      // // T = Readonly<E>
      // // Readonly<Readonly<E>> -> Readonly<E>
      // if (isReadonlyNode(T)) {
      //   return T;
      // }

      // // T = A | B | C
      // if (ts.isUnionTypeNode(T)) {
      //   // T = readonly A[] | Readonly<B>
      //   // Readonly<readonly A[] | Readonly<B>> -> readonly A[] | Readonly<B>
      //   if (T.types.every((t) => isReadonlyArrayNode(t) || isReadonlyNode(t))) {
      //     return T;
      //   }

      //   return createReadonlyTypeNode(T, context);
      // }
      // // T = A & B & C
      // if (ts.isIntersectionTypeNode(T)) {
      //   // T = readonly A[] & Readonly<B>
      //   // Readonly<readonly A[] & Readonly<B>> -> readonly A[] & Readonly<B>
      //   if (T.types.every((t) => isReadonlyArrayNode(t) || isReadonlyNode(t))) {
      //     return T;
      //   }

      //   return createReadonlyTypeNode(T, context);
      // }
    }
  }

  // Recursive processing
  const newTypeArguments = context.factory.createNodeArray(
    node.typeArguments?.map((n) =>
      transformNode(n, visitor, context, 'none'),
    ) ?? [],
  );

  return context.factory.updateTypeReferenceNode(
    node,
    node.typeName,
    newTypeArguments,
  );
};

/** `E[]` -> `readonly E[]` */
const transformArrayTypeNode = (
  node: ts.ArrayTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: 'DeepReadonly' | 'Readonly' | 'readonly' | 'none',
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
  readonlyContext: 'DeepReadonly' | 'Readonly' | 'readonly' | 'none',
): ts.TupleTypeNode | ts.TypeOperatorNode => {
  const nextReadonlyContext = readonlyContext === 'deep' ? 'deep' : 'none';

  // Recursive processing
  const Es = node.elements.map((el) =>
    ts.isNamedTupleMember(el)
      ? context.factory.updateNamedTupleMember(
          el,
          undefined,
          el.name,
          undefined,
          transformNode(el.type, visitor, context, nextReadonlyContext),
        )
      : transformNode(el, visitor, context, nextReadonlyContext),
  );

  switch (readonlyContext) {
    case 'deep':
    case 'shallow':
      return context.factory.updateTupleTypeNode(node, Es);

    case 'none':
      return context.factory.createTypeOperatorNode(
        ts.SyntaxKind.ReadonlyKeyword,
        context.factory.updateTupleTypeNode(node, Es),
      );
  }

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

/** `...readonly E[]` -> `...E'[]` */
const transformRestTypeNode = (
  node: ts.RestTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: 'DeepReadonly' | 'Readonly' | 'readonly' | 'none',
): ts.RestTypeNode => {
  // Recursive processing
  const T = transformNode(
    node.type /* = E */,
    visitor,
    context,
    readonlyContext === 'DeepReadonly' ? 'DeepReadonly' : 'none',
  );

  if (isReadonlyArrayNode(T) || isReadonlyTupleNode(T)) {
    return context.factory.updateRestTypeNode(node, T.type);
  }

  return context.factory.updateRestTypeNode(node, T);
};

/** `Readonly<A> & Readonly<B>` -> `Readonly<A & B>` */
const transformIntersectionTypeNode = (
  node: ts.IntersectionTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: 'DeepReadonly' | 'Readonly' | 'readonly' | 'none',
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
  readonlyContext: 'DeepReadonly' | 'Readonly' | 'readonly' | 'none',
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
  readonlyContext: 'DeepReadonly' | 'Readonly' | 'readonly' | 'none',
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

  // remove () if T is PrimitiveTypeNode
  // e.g. `(number)` -> `number`
  if (isPrimitiveTypeNode(T)) return T;

  // remove () if T is TypeLiteralNode
  // e.g. `({ member: V })` -> `{ member: V }`
  if (ts.isTypeLiteralNode(T)) return T;

  // otherwise, keep ()
  return context.factory.updateParenthesizedType(node, T);
};

// const removeParentheses = (node: ts.TypeNode): ts.TypeNode =>
//   ts.isParenthesizedTypeNode(node) ? node.type : node;

/**
 * `tr(["member1: V1", "member2: V2", "member3: V3"])`
 *
 * -> `["member1: tr(V1)", "member2: tr(V2)", "member3: tr(V3)"]`
 */
const transformMembers = (
  members: ts.NodeArray<ts.TypeElement>,
  readonlyModifier: 'remove' | 'keep',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: 'DeepReadonly' | 'none',
): ts.NodeArray<ts.TypeElement> =>
  context.factory.createNodeArray(
    members.map((mb) => {
      console.debug(
        `transformMembers [${ts.SyntaxKind[mb.kind]}]`,
        printNode(mb, mb.getSourceFile()),
      );

      if (ts.isPropertySignature(mb)) {
        return transformPropertySignature(
          mb,
          readonlyModifier,
          visitor,
          context,
          readonlyContext,
        );
      }
      if (ts.isIndexSignatureDeclaration(mb)) {
        return transformIndexSignatureDeclaration(
          mb,
          readonlyModifier,
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
  readonlyModifier: 'remove' | 'keep',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: 'DeepReadonly' | 'none',
): ts.PropertySignature =>
  context.factory.updatePropertySignature(
    node,
    strictMatch(readonlyModifier, {
      remove: removeReadonlyFromModifiers(node.modifiers),
      keep: node.modifiers,
    }),
    node.name,
    node.questionToken,
    mapOptional(node.type, (t) => transformNode(t, visitor, context)),
  );

const transformIndexSignatureDeclaration = (
  node: ts.IndexSignatureDeclaration,
  readonlyModifier: 'remove' | 'keep',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.IndexSignatureDeclaration =>
  context.factory.updateIndexSignature(
    node,
    strictMatch(readonlyModifier, {
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
