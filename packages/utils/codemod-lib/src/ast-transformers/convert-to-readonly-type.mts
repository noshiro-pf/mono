/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import {
  Arr,
  expectType,
  mapOptional,
  SafeUint,
  strictMatch,
} from '@noshiro/ts-utils';
import * as ts from 'typescript';
import {
  createReadonlyArrayTypeNode,
  createReadonlyTupleTypeNode,
  createReadonlyTypeNode,
  createReadonlyTypeOperatorNode,
  isPrimitiveTypeNode,
  isReadonlyArrayTypeNode,
  isReadonlyTupleTypeNode,
  isReadonlyTypeNode,
  nextReadonlyContext,
  type ReadonlyContext,
} from '../functions/index.mjs';
import { createTransformerFactory, printNode } from '../utils/index.mjs';
import { debugPrintWrapper } from './test-utils.mjs';

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
      transformNode(node, visitor, context, 'none', 0);

    return visitor;
  });

type TransformNodeFn = <N extends ts.Node>(
  node: N,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
  depth: SafeUintWithSmallInt,
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
const transformNode: TransformNodeFn = ((
  node,
  visitor,
  context,
  readonlyContext,
  depth,
) => {
  console.debug(`transformNode\t[${ts.SyntaxKind[node.kind]}]`);
  console.debug(printNode(node));
  console.debug();

  if (ts.isTypeReferenceNode(node)) {
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeReferenceNode',
      );
    }
    return debugPrintWrapper(
      'transformTypeReferenceNode',
      node,
      transformTypeReferenceNode(
        node,
        visitor,
        context,
        readonlyContext,
        depth,
      ),
      depth,
    );
  }

  if (ts.isTypeLiteralNode(node)) {
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeReferenceNode',
      );
    }
    return debugPrintWrapper(
      'transformTypeLiteralNode',
      node,
      transformTypeLiteralNode(node, visitor, context, readonlyContext, depth),
      depth,
    );
  }

  if (ts.isMappedTypeNode(node)) {
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to MappedTypeNode',
      );
    }
    return debugPrintWrapper(
      'transformMappedTypeNode',
      node,
      transformMappedTypeNode(node, visitor, context, readonlyContext, depth),
      depth,
    );
  }

  if (ts.isInterfaceDeclaration(node)) {
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to InterfaceDeclaration',
      );
    }
    return debugPrintWrapper(
      'transformInterfaceDeclarationNode',
      node,
      transformInterfaceDeclarationNode(
        node,
        visitor,
        context,
        readonlyContext,
        depth,
      ),
      depth,
    );
  }

  if (ts.isClassDeclaration(node)) {
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to ClassDeclaration',
      );
    }
    return debugPrintWrapper(
      'transformClassDeclarationNode',
      node,
      transformClassDeclarationNode(
        node,
        visitor,
        context,
        readonlyContext,
        depth,
      ),
      depth,
    );
  }

  if (ts.isArrayTypeNode(node)) {
    return debugPrintWrapper(
      'transformArrayTypeNode',
      node,
      transformArrayTypeNode(node, visitor, context, readonlyContext, depth),
      depth,
    );
  }
  if (ts.isTupleTypeNode(node)) {
    return debugPrintWrapper(
      'transformTupleTypeNode',
      node,
      transformTupleTypeNode(node, visitor, context, readonlyContext, depth),
      depth,
    );
  }
  if (ts.isRestTypeNode(node)) {
    return debugPrintWrapper(
      'transformRestTypeNode',
      node,
      transformRestTypeNode(node, visitor, context, readonlyContext, depth),
      depth,
    );
  }
  if (ts.isTypeOperatorNode(node)) {
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeOperatorNode',
      );
    }
    return debugPrintWrapper(
      'transformTypeOperatorNode',
      node,
      transformTypeOperatorNode(node, visitor, context, readonlyContext, depth),
      depth,
    );
  }

  if (ts.isIntersectionTypeNode(node)) {
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to IntersectionTypeNode',
      );
    }
    return debugPrintWrapper(
      'transformIntersectionTypeNode',
      node,
      transformIntersectionTypeNode(
        node,
        visitor,
        context,
        readonlyContext,
        depth,
      ),
      depth,
    );
  }

  if (ts.isUnionTypeNode(node)) {
    if (readonlyContext === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to UnionTypeNode',
      );
    }
    return debugPrintWrapper(
      'transformUnionTypeNode',
      node,
      transformUnionTypeNode(node, visitor, context, readonlyContext, depth),
      depth,
    );
  }

  if (ts.isParenthesizedTypeNode(node)) {
    return debugPrintWrapper(
      'transformParenthesizedTypeNode',
      node,
      transformParenthesizedTypeNode(
        node,
        visitor,
        context,
        readonlyContext,
        depth,
      ),
      depth,
    );
  }

  console.debug('(recursion)');
  console.debug();

  return ts.visitEachChild(node, visitor, context);
}) as TransformNodeFn;

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
        printNode(mb),
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

/** `tr(E[]) |-> tr(E)[]` */
const transformArrayTypeNode = (
  node: ts.ArrayTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
  depth: SafeUintWithSmallInt,
): ts.ArrayTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const E = transformNode(
    node.elementType,
    visitor,
    context,
    nextReadonlyContext(readonlyContext, 'none'),
    SafeUint.add(1, depth),
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
  depth: SafeUintWithSmallInt,
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
            SafeUint.add(1, depth),
          ),
        )
      : transformNode(
          el,
          visitor,
          context,
          nextReadonlyContext(readonlyContext, 'none'),
          SafeUint.add(1, depth),
        ),
  );

  switch (readonlyContext) {
    case 'DeepReadonly':
    case 'Readonly':
    case 'readonly':
      // skip if already readonly
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
  depth: SafeUintWithSmallInt,
): ts.RestTypeNode => {
  // Recursive processing
  const R = transformNode(
    node.type /* = T */,
    visitor,
    context,
    readonlyContext === 'DeepReadonly' ? 'DeepReadonly' : 'none',
    SafeUint.add(1, depth),
  );

  // `tr("...readonly E[]") |-> ...tr(E)[]`
  // `tr("...readonly [E1, E2]") |-> ...[tr(E1), tr(E2)]`
  if (isReadonlyArrayTypeNode(R) || isReadonlyTupleTypeNode(R)) {
    return context.factory.updateRestTypeNode(
      node,
      R.type /* = tr(E)[] or [tr(E1), tr(E2)] */,
    );
  }

  return context.factory.updateRestTypeNode(node, R);
};

/**
 * - `readonly T[][] |-> readonly (readonly T[])[]`
 * - `keyof { a: number[] } |-> keyof Readonly<{ a: readonly number[] }>`
 */
const transformTypeOperatorNode = (
  node: ts.TypeOperatorNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<ReadonlyContext, 'readonly'>,
  depth: SafeUintWithSmallInt,
): ts.TypeNode => {
  // Recursive processing
  const newType = transformNode(
    node.type,
    visitor,
    context,
    nextReadonlyContext(
      readonlyContext,
      node.operator === ts.SyntaxKind.ReadonlyKeyword ? 'readonly' : 'none',
    ),
    SafeUint.add(1, depth),
  );

  return context.factory.updateTypeOperatorNode(node, newType);
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
  readonlyContext: Exclude<ReadonlyContext, 'readonly'>,
  depth: SafeUintWithSmallInt,
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

/**
 * - `tr(A & B) -> tr(A) & tr(B)`
 * - `tr(Readonly<A> & Readonly<B>) -> Readonly<tr(A) & tr(B)>`
 */
const transformIntersectionTypeNode = (
  node: ts.IntersectionTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<ReadonlyContext, 'readonly'>,
  depth: SafeUintWithSmallInt,
): ts.IntersectionTypeNode | ts.TypeReferenceNode => {
  // Recursive processing
  const newTypes = node.types /* = [A, B] */
    .map((n) =>
      transformNode(
        n,
        visitor,
        context,
        readonlyContext,
        SafeUint.add(1, depth),
      ),
    );

  // MEMO: readonlyContext == Readonly の場合、 newTypes は mutable type に変換されている。
  // Readonly<*> & ... & Readonly<*> が直接渡されることはある。

  if (newTypes.every(isReadonlyTypeNode)) {
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
 * - `tr(A | B) |-> tr(A) | tr(B)`
 * - `tr(Readonly<A> | Readonly<B>) |-> Readonly<tr(A) | tr(B)>`
 */
const transformUnionTypeNode = (
  node: ts.UnionTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<ReadonlyContext, 'readonly'>,
  depth: SafeUintWithSmallInt,
): ts.UnionTypeNode | ts.TypeReferenceNode => {
  // Recursive processing
  const newTypes = node.types /* = [A, B] */
    .map((n) =>
      transformNode(
        n,
        visitor,
        context,
        readonlyContext,
        SafeUint.add(1, depth),
      ),
    );

  // MEMO: readonlyContext == Readonly の場合、 newTypes は mutable type に変換されている。
  // Readonly<*> | ... | Readonly<*> が直接渡されることはある。

  if (newTypes.every(isReadonlyTypeNode)) {
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
  depth: SafeUintWithSmallInt,
): ts.TypeNode => {
  if (ts.isParenthesizedTypeNode(node.type)) {
    // Recursive processing
    return transformParenthesizedTypeNode(
      node.type,
      visitor,
      context,
      readonlyContext,
      SafeUint.add(1, depth),
    );
  }

  const T = transformNode(
    node.type,
    visitor,
    context,
    readonlyContext,
    SafeUint.add(1, depth),
  );

  // remove () if T is TypeReferenceNode
  // e.g. `(Readonly<A>) |-> Readonly<A>`
  if (ts.isTypeReferenceNode(T)) return T;

  // remove () if T is TypeOperatorNode
  // e.g. `(readonly A[]) |-> readonly A[]`
  if (ts.isTypeOperatorNode(T)) return T;

  // remove () if T is ArrayTypeNode
  // e.g. `(A[]) |-> A[]`
  if (ts.isArrayTypeNode(T)) return T;

  // remove () if T is TupleTypeNode
  // e.g. `([A]) |-> [A]`
  if (ts.isTupleTypeNode(T)) return T;

  // remove () if T is PrimitiveTypeNode
  // e.g. `(number) |-> number`
  if (isPrimitiveTypeNode(T)) return T;

  // remove () if T is TypeLiteralNode
  // e.g. `({ member: V }) |-> { member: V }`
  if (ts.isTypeLiteralNode(T)) return T;

  // otherwise, keep ()
  return context.factory.updateParenthesizedType(node, T);
};

const removeParentheses = (node: ts.TypeNode): ts.TypeNode =>
  ts.isParenthesizedTypeNode(node) ? node.type : node;

/**
 * `tr(["member1: V1", "member2: V2", "member3: V3"])`
 *
 * -> `["member1: tr(V1)", "member2: tr(V2)", "member3: tr(V3)"]`
 */
const transformMembers = (
  members: ts.NodeArray<ts.TypeElement>,
  readonly: 'add' | 'remove',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
): ts.NodeArray<ts.TypeElement> =>
  context.factory.createNodeArray(
    members.map((mb) => {
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
