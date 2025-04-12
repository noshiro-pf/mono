/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { Arr, expectType, mapOptional, strictMatch } from '@noshiro/ts-utils';
import * as ts from 'typescript';
import {
  createReadonlyArrayTypeNode,
  createReadonlyTypeNode,
  createReadonlyTypeOperatorNode,
  isPrimitiveTypeNode,
  isReadonlyArrayNode,
  isReadonlyNode,
  isReadonlyTupleNode,
  nextReadonlyContext,
  type ReadonlyContext,
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
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeReferenceNode',
      );
    }
    return transformTypeReferenceNode(node, visitor, context, readonlyContext);
  }

  if (ts.isTypeLiteralNode(node)) {
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeReferenceNode',
      );
    }
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
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to IntersectionTypeNode',
      );
    }
    return transformIntersectionTypeNode(
      node,
      visitor,
      context,
      readonlyContext,
    );
  }

  if (ts.isUnionTypeNode(node)) {
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to UnionTypeNode',
      );
    }
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
  readonlyContext: Exclude<ReadonlyContext, 'readonly'>,
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
      const T = transformNode(
        typeArguments[0],
        visitor,
        context,
        nextReadonlyContext(readonlyContext, 'Readonly'),
      );

      // Readonly<Readonly<T>> -> Readonly<T>
      // DeepReadonly<Readonly<T>> -> DeepReadonly<T>
      if (
        readonlyContext === 'DeepReadonly' ||
        readonlyContext === 'Readonly'
      ) {
        return T;
      }

      // Readonly<number> -> number
      if (isPrimitiveTypeNode(T)) {
        return T;
      }

      // T = E[]
      // Readonly<E[]> -> readonly E[]
      // Readonly<readonly E[]> -> Readonly<E[]> -> readonly E[]
      //
      // T = [E1, E2, E3]
      // Readonly<[E1, E2, E3]> -> readonly [E1, E2, E3]
      // Readonly<readonly [E1, E2, E3]> -> Readonly<[E1, E2, E3]> -> readonly [E1, E2, E3]
      if (ts.isArrayTypeNode(T) || ts.isTupleTypeNode(T)) {
        return createReadonlyTypeOperatorNode(T, context);
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

/** `tr(E[]) |-> tr(E)[]` */
const transformArrayTypeNode = (
  node: ts.ArrayTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
): ts.ArrayTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const E = transformNode(
    node.elementType,
    visitor,
    context,
    nextReadonlyContext(readonlyContext, 'none'),
  );

  switch (readonlyContext) {
    case 'DeepReadonly':
    case 'Readonly':
    case 'readonly':
      return context.factory.updateArrayTypeNode(node, E);

    case 'none':
      return createReadonlyTypeOperatorNode(
        context.factory.updateArrayTypeNode(node, E),
        context,
      );
  }
};

/** `tr([E1, E2, E3])` |-> `[tr(E1), tr(E2), tr(E3)]` */
const transformTupleTypeNode = (
  node: ts.TupleTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
): ts.TupleTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const Es = node.elements.map((el) =>
    ts.isNamedTupleMember(el)
      ? context.factory.updateNamedTupleMember(
          el,
          undefined,
          el.name,
          undefined,
          transformNode(
            el.type,
            visitor,
            context,
            nextReadonlyContext(readonlyContext, 'none'),
          ),
        )
      : transformNode(
          el,
          visitor,
          context,
          nextReadonlyContext(readonlyContext, 'none'),
        ),
  );

  switch (readonlyContext) {
    case 'DeepReadonly':
    case 'Readonly':
    case 'readonly':
      return context.factory.updateTupleTypeNode(node, Es);

    case 'none':
      return createReadonlyTypeOperatorNode(
        context.factory.updateTupleTypeNode(node, Es),
        context,
      );
  }
};

/** `tr("...T")` |-> `...tr(T)` */
const transformRestTypeNode = (
  node: ts.RestTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
): ts.RestTypeNode => {
  // Recursive processing
  const R = transformNode(
    node.type /* = T */,
    visitor,
    context,
    readonlyContext === 'DeepReadonly' ? 'DeepReadonly' : 'none',
  );

  // `tr("...readonly E[]")` -> `...tr(E)[]`
  // `tr("...readonly [E1, E2]")` -> `...[tr(E1), tr(E2)]`
  if (isReadonlyArrayNode(R) || isReadonlyTupleNode(R)) {
    return context.factory.updateRestTypeNode(
      node,
      R.type /* = tr(E)[] or [tr(E1), tr(E2)] */,
    );
  }

  return context.factory.updateRestTypeNode(node, R);
};

/**
 * - `tr(A & B) -> tr(A) & tr(B)`
 * - `tr(Readonly<A> & Readonly<B>) -> Readonly<tr(A) & tr(B)>`
 */
const transformIntersectionTypeNode = (
  node: ts.IntersectionTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<ReadonlyContext, 'readonly'>,
): ts.IntersectionTypeNode | ts.TypeReferenceNode => {
  // Recursive processing
  const newTypes = node.types /* = [A, B] */
    .map((n) =>
      transformNode(
        n,
        visitor,
        context,
        nextReadonlyContext(readonlyContext, 'none'),
      ),
    );

  console.debug(
    'Intersection converted',
    newTypes.map((n) => printNode(n, node.getSourceFile())),
  );

  if (newTypes.every(isReadonlyNode)) {
    // Readonly<*> & ... & Readonly<*>
    const args = context.factory.createNodeArray(
      newTypes.map((type) => type.typeArguments[0]),
    );

    switch (readonlyContext) {
      case 'DeepReadonly':
      case 'Readonly':
        return context.factory.updateIntersectionTypeNode(node, args);

      case 'none':
        return createReadonlyTypeNode(
          context.factory.updateIntersectionTypeNode(node, args),
          context,
        );
    }
  }

  return context.factory.updateIntersectionTypeNode(
    node,
    context.factory.createNodeArray(newTypes),
  );
};

/**
 * - `tr(A | B) -> tr(A) | tr(B)`
 * - `tr(Readonly<A> | Readonly<B>) -> Readonly<tr(A) | tr(B)>`
 */
const transformUnionTypeNode = (
  node: ts.UnionTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<ReadonlyContext, 'readonly'>,
): ts.UnionTypeNode | ts.TypeReferenceNode => {
  // Recursive processing
  const newTypes = node.types /* = [A, B] */
    .map((n) =>
      transformNode(
        n,
        visitor,
        context,
        nextReadonlyContext(readonlyContext, 'none'),
      ),
    );

  console.debug(
    'Union converted',
    newTypes.map((n) => printNode(n, node.getSourceFile())),
  );

  if (newTypes.every(isReadonlyNode)) {
    // Readonly<*> | ... | Readonly<*>
    const args = context.factory.createNodeArray(
      newTypes.map((type) => type.typeArguments[0]),
    );

    switch (readonlyContext) {
      case 'DeepReadonly':
      case 'Readonly':
        return context.factory.updateUnionTypeNode(node, args);

      case 'none':
        return createReadonlyTypeNode(
          context.factory.updateUnionTypeNode(node, args),
          context,
        );
    }
  }

  return context.factory.updateUnionTypeNode(
    node,
    context.factory.createNodeArray(newTypes),
  );
};

/** Convert ((T)) -> (T) recursively */
const transformParenthesizedTypeNode = (
  node: ts.ParenthesizedTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
): ts.TypeNode => {
  if (ts.isParenthesizedTypeNode(node.type)) {
    // Recursive processing
    return transformParenthesizedTypeNode(
      node.type,
      visitor,
      context,
      readonlyContext,
    );
  }

  const T = transformNode(node.type, visitor, context, readonlyContext);

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
  readonlyContext: Extract<ReadonlyContext, 'DeepReadonly' | 'none'>,
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
          readonlyContext,
        );
      }

      return transformNode(mb, visitor, context, readonlyContext);
    }),
    members.hasTrailingComma,
  );

const transformPropertySignature = (
  node: ts.PropertySignature,
  readonlyModifier: 'remove' | 'keep',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Extract<ReadonlyContext, 'DeepReadonly' | 'none'>,
): ts.PropertySignature =>
  context.factory.updatePropertySignature(
    node,
    strictMatch(readonlyModifier, {
      remove: removeReadonlyFromModifiers(node.modifiers),
      keep: node.modifiers,
    }),
    node.name,
    node.questionToken,
    mapOptional(node.type, (t) =>
      transformNode(t, visitor, context, readonlyContext),
    ),
  );

const transformIndexSignatureDeclaration = (
  node: ts.IndexSignatureDeclaration,
  readonlyModifier: 'remove' | 'keep',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Extract<ReadonlyContext, 'DeepReadonly' | 'none'>,
): ts.IndexSignatureDeclaration =>
  context.factory.updateIndexSignature(
    node,
    strictMatch(readonlyModifier, {
      remove: removeReadonlyFromModifiers(node.modifiers),
      keep: node.modifiers,
    }),
    node.parameters.map((n) =>
      transformNode(n, visitor, context, readonlyContext),
    ),
    transformNode(node.type, visitor, context, readonlyContext),
  );

const removeReadonlyFromModifiers = <M extends ts.ModifierLike>(
  modifiers: ts.NodeArray<M> | undefined,
): readonly M[] | undefined =>
  modifiers?.filter((m) => !ts.isReadonlyKeywordOrPlusOrMinusToken(m));
