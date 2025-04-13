import {
  Arr,
  expectType,
  ISet,
  isString,
  mapOptional,
  pipe,
  strictMatch,
} from '@noshiro/ts-utils';
import * as tsm from 'ts-morph';
import {
  hasDisableNextLineComment,
  isPrimitiveTypeNode,
  isReadonlyArrayTypeNode,
  isReadonlyTupleOrArrayTypeNode,
  isReadonlyTupleTypeNode,
  isReadonlyTypeReferenceNode,
  removeParentheses,
  unwrapReadonlyTypeArgText,
  wrapWithParentheses,
} from '../functions/index.mjs';
import { replaceNodeWithDebugPrint } from '../utils/index.mjs';
import {
  groupUnionIntersectionTypes,
  invalidDeepReadonlyTypeName,
  nextReadonlyContext,
  type ReadonlyContext,
} from './readonly-transformer-helpers/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

export const convertToReadonlyTypeTransformer =
  (options?: ReadonlyTransformerOptions): TsMorphTransformer =>
  (sourceAst) => {
    if (
      options?.DeepReadonly?.typeName !== undefined &&
      invalidDeepReadonlyTypeName.has(options.DeepReadonly.typeName)
    ) {
      throw new Error(
        `Invalid DeepReadonly typeName "${options.DeepReadonly.typeName}" passed to convertToReadonlyType`,
      );
    }

    const DeepReadonlyTypeName =
      options?.DeepReadonly?.typeName ?? 'DeepReadonly';

    const ignorePrefixes = ISet.new(options?.ignorePrefixes ?? ['mut_']);

    const optionsInternal: ReadonlyTransformerOptionsInternal = {
      DeepReadonly: {
        typeName: DeepReadonlyTypeName,
        applyLevel: 'keep',
      },
      ignoreEmptyObjectTypes: options?.ignoreEmptyObjectTypes ?? true,
      ignoredPrefixes: ignorePrefixes,
    };

    for (const node of sourceAst.getChildren()) {
      transformNode(node, initialReadonlyContext, optionsInternal);
    }
  };

export type ReadonlyTransformerOptions = DeepReadonly<{
  /**
   * Options for a type utility `DeepReadonly` that recursively applies readonly.
   */
  DeepReadonly?: {
    /**
     * The name of a type utility that recursively applies `Readonly`.
     *
     * @default "DeepReadonly"
     */
    typeName?: string;

    /**
     * Whether to apply `DeepReadonly` aggressively or remove `DeepReadonly` as
     * possible.
     *
     * If `applyLevel` is `"applyAgressively"`, it applies `DeepReadonly` to all
     * nested type literals without external type references. For example, the
     * following conversions are applied:
     *
     * - `number[][]` to be `DeepReadonly<number[][]>`
     * - `number[]` to be `readonly number[]`
     * - `<T>(arg: T[][]) => void` to be `<T>(arg: readonly (readonly T[])[]>) =>
     *   void`
     *
     * If `applyLevel` is `"removeAsPossible"`, the following conversions are applied:
     *
     * - `DeepReadonly<number[][]>` to be `readonly (readonly number[])[]`
     * - `DeepReadonly<{ a: number[] }>` to be `Readonly<{ a: readonly number[]
     *   }>`
     * - `<T>(arg: DeepReadonly<T[][]>) => void` to be `<T>(arg:
     *   DeepReadonly<T[][]>) => void`
     *
     * @default 'keep'
     */
    // TODO
    // applyLevel?: 'applyAgressively' | 'keep' | 'removeAsPossible';
  };

  /**
   * Ignore the readonly conversion for `{}`.
   *
   * @default true
   */
  ignoreEmptyObjectTypes?: boolean;

  /**
   * A mute keywords to ignore the readonly conversion.
   *
   * (e.g. `"mut_"`)
   */
  ignorePrefixes?: string[];
}>;

type ReadonlyTransformerOptionsInternal = Readonly<{
  DeepReadonly: Readonly<{
    typeName: string;

    // removeAsPossible: 正規化後、 DeepReadonly の子ノードが typeLiteral かまたはその union or intersection であり、 それぞれの TypeLiteral がプリミティブ値のメンバーしか持たない場合。
    applyLevel: 'applyAgressively' | 'keep' | 'removeAsPossible';
  }>;

  ignoreEmptyObjectTypes: boolean;

  ignoredPrefixes: ISet<string>;
}>;

const initialReadonlyContext: ReadonlyContext = {
  type: 'none',
  indexedAccessDepth: 0,
} as const;

const transformNode = (
  node: tsm.Node,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  if (
    tsm.Node.isTypeNode(node) ||
    node.isKind(tsm.SyntaxKind.InterfaceDeclaration) ||
    node.isKind(tsm.SyntaxKind.ClassDeclaration)
  ) {
    console.debug();
    console.debug(`transformNode [${node.getKindName()}] `);
    console.debug(node.getFullText());
    console.debug({ readonlyContext });
    console.debug();
  }

  if (hasDisableNextLineComment(node)) {
    console.debug('skipped by disable-next-line comment');
    return;
  }

  // check for ignorePrefix
  if (node.isKind(tsm.SyntaxKind.VariableDeclaration)) {
    const nodeName = node.getName();

    if (options.ignoredPrefixes.some((p) => nodeName.startsWith(p))) {
      // Skip conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without appending `as const`
      console.debug('skipped variable declaration by ignorePrefixes');
      return;
    }

    // TODO: Support ignoredPrefixes in ArrayBindingPattern
    // if (ts.isArrayBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }

    // TODO: Support ignoredPrefixes in ObjectBindingPattern
    // if (ts.isObjectBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }
  }

  // Skip readonly conversion for function declarations with ignored prefixes
  // Example: function mut_foo() {} -> parameters and return types remain as is
  if (
    (node.isKind(tsm.SyntaxKind.FunctionDeclaration) ||
      node.isKind(tsm.SyntaxKind.FunctionExpression)) &&
    options.ignoredPrefixes.some((p) => node.getName()?.startsWith(p) === true)
  ) {
    return;
  }

  if (node.isKind(tsm.SyntaxKind.Parameter)) {
    const nodeName = node.getName();

    if (options.ignoredPrefixes.some((p) => nodeName.startsWith(p))) {
      // Skip readonly conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without readonly conversion
      return;
    }

    // TODO: Support ignoredPrefixes in ArrayBindingPattern
    // if (ts.isArrayBindingPattern(nodeName)) {
    // }

    // TODO: Support ignoredPrefixes in ObjectBindingPattern
    // if (ts.isObjectBindingPattern(nodeName)) {
    // }
  }

  // Skip readonly conversion for type alias declarations with ignored prefixes
  // Example: type mut_Foo = number[]; -> remains as number[] without readonly
  if (
    node.isKind(tsm.SyntaxKind.TypeAliasDeclaration) &&
    options.ignoredPrefixes.some((p) => node.getName().startsWith(p))
  ) {
    return;
  }

  if (node.isKind(tsm.SyntaxKind.TypeReference)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeReferenceNode',
      );
    }
    transformTypeReferenceNode(node, readonlyContext, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.ArrayType)) {
    transformArrayTypeNode(node, readonlyContext, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.TupleType)) {
    transformTupleTypeNode(node, readonlyContext, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.RestType)) {
    transformRestTypeNode(node, readonlyContext, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.TypeOperator)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeOperatorNode',
      );
    }
    transformTypeOperatorNode(node, readonlyContext, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.TypeLiteral)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeReferenceNode',
      );
    }
    transformTypeLiteralNode(node, readonlyContext, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.IndexedAccessType)) {
    transformIndexedAccessTypeNode(node, readonlyContext, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.MappedType)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to MappedTypeNode',
      );
    }

    transformMappedTypeNode(node, readonlyContext, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.InterfaceDeclaration)) {
    // Skip readonly conversion for interface declarations with ignored prefixes
    // Example: interface mut_Interface {...} -> properties remain without readonly
    if (options.ignoredPrefixes.some((p) => node.getName().startsWith(p))) {
      return;
    }

    transformInterfaceDeclarationNode(node, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.ClassDeclaration)) {
    // Skip readonly conversion for class declarations with ignored prefixes
    // Example: class mut_Class {...} -> properties remain without readonly
    if (
      options.ignoredPrefixes.some(
        (p) => node.getName()?.startsWith(p) === true,
      )
    ) {
      return;
    }

    transformClassDeclarationNode(node, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.IntersectionType)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to IntersectionTypeNode',
      );
    }

    transformIntersectionTypeNode(node, readonlyContext, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.UnionType)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to UnionTypeNode',
      );
    }

    transformUnionTypeNode(node, readonlyContext, options);
    return;
  }

  if (node.isKind(tsm.SyntaxKind.ParenthesizedType)) {
    // NOTE: readonlyContext を不変のままバケツリレーさせるためにこのケースも必要
    transformParenthesizedTypeNode(node, readonlyContext, options);
    return;
  }

  for (const child of node.getChildren()) {
    transformNode(child, initialReadonlyContext, options);
  }
};

//
// Transformer implementation for each node type
//

/**
 * - `tr(ReadonlyArray<E>) |-> readonly tr(E)[]`
 * - `tr(Readonly<Readonly<E>>) |-> Readonly<tr(E)>`
 * - `tr(DeepReadonly<Readonly<E>>) |-> DeepReadonly<tr(E)>`
 * - `tr(Readonly<number>) |-> number`
 * - `tr(Readonly<E[]>) |-> readonly tr(E)[]`
 * - `tr(Readonly<[E1, E2, E3]>) |-> readonly [tr(E1), tr(E2), tr(E3)]`
 * - `tr(Readonly<readonly E[]>) |-> readonly tr(E)[]`
 * - `tr(Readonly<readonly [E1, E2, E3]>) |-> readonly [tr(E1), tr(E2), tr(E3)]`
 * - `tr(Readonly<A | readonly E[]>) |-> Readonly<tr(A)> | readonly tr(E)[]>`
 */
const transformTypeReferenceNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeReferenceNode,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: SafeUintWithSmallInt }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  const typeNameStr = node.getTypeName().getText();
  const typeArguments = node.getTypeArguments();

  // Array<T> / ReadonlyArray<T> to readonly T[]
  if (typeNameStr === 'Array' || typeNameStr === 'ReadonlyArray') {
    if (!Arr.isArrayOfLength1(typeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${typeArguments.length}" for ${typeNameStr}.`,
      );
    }

    // Recursive processing
    transformNode(
      typeArguments[0],
      {
        type: 'none',
        indexedAccessDepth: readonlyContext.indexedAccessDepth,
      },
      options,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const T = node.getTypeArguments()[0]!;

    replaceNodeWithDebugPrint(
      node,
      readonlyContext.type === 'DeepReadonly'
        ? wrapWithParentheses(`${wrapWithParentheses(T.getFullText())}[]`)
        : wrapWithParentheses(
            `readonly ${wrapWithParentheses(T.getFullText())}[]`,
          ),
    );

    return;
  }

  // Set<T> to ReadonlySet<T>
  if (typeNameStr === 'Set') {
    if (!Arr.isArrayOfLength1(typeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${typeArguments.length}" for Set.`,
      );
    }

    // Recursive processing
    transformNode(
      typeArguments[0],
      {
        type: 'none',
        indexedAccessDepth: readonlyContext.indexedAccessDepth,
      },
      options,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const T = node.getTypeArguments()[0]!;

    replaceNodeWithDebugPrint(node, `ReadonlySet<${T.getFullText()}>`);

    return;
  }

  // Map<T> to ReadonlyMap<T>
  if (typeNameStr === 'Map') {
    if (!Arr.isArrayOfLength2(typeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${typeArguments.length}" for Map.`,
      );
    }

    const nextReadonlyContextValue = nextReadonlyContext({
      currentReadonlyContext: readonlyContext,
      nextReadonlyContextType: 'none',
      indexedAccessDepthChange: 'keep',
    });

    // Recursive processing
    for (const t of typeArguments) {
      transformNode(t, nextReadonlyContextValue, options);
    }

    const [K, V] = node.getTypeArguments();

    replaceNodeWithDebugPrint(
      node,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      `ReadonlyMap<${K!.getFullText()}, ${V!.getFullText()}>`,
    );

    return;
  }

  // remove unnecessary `Readonly` wrapper or convert to readonly operator
  if (typeNameStr === 'Readonly') {
    if (!Arr.isArrayOfLength1(typeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${typeArguments.length}" for Readonly.`,
      );
    }

    // Recursive processing
    transformNode(
      typeArguments[0],
      nextReadonlyContext({
        currentReadonlyContext: readonlyContext,
        nextReadonlyContextType: 'Readonly',
        indexedAccessDepthChange: 'keep',
      }),
      options,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const T = removeParentheses(node.getTypeArguments()[0]!);

    // DeepReadonly<Readonly<T>> -> DeepReadonly<T>
    if (readonlyContext.type === 'DeepReadonly') {
      replaceNodeWithDebugPrint(node, T.getFullText());
      return;
    }

    // Readonly<{ ... }>[I] -> { ... }[I]
    if (readonlyContext.indexedAccessDepth > 0) {
      replaceNodeWithDebugPrint(node, T.getFullText());
      return;
    }

    // Readonly<Readonly<T>> -> Readonly<T>
    if (isReadonlyTypeReferenceNode(T)) {
      replaceNodeWithDebugPrint(node, T.getFullText());
      return;
    }

    // Readonly<number> -> number
    if (isPrimitiveTypeNode(T)) {
      replaceNodeWithDebugPrint(node, T.getFullText());
      return;
    }

    // T = E[]
    // Readonly<E[]> -> readonly E[]
    //
    // T = [E1, E2, E3]
    // Readonly<[E1, E2, E3]> -> readonly [E1, E2, E3]
    if (
      T.isKind(tsm.SyntaxKind.ArrayType) ||
      T.isKind(tsm.SyntaxKind.TupleType)
    ) {
      replaceNodeWithDebugPrint(
        node,
        wrapWithParentheses(`readonly ${T.getFullText()}`),
      );
      return;
    }

    // T = readonly E[] or readonly [E1, E2, E3]
    // Readonly<readonly E[]> -> readonly E[]
    // Readonly<readonly [E1, E2, E3]> -> readonly [E1, E2, E3]
    if (isReadonlyTupleOrArrayTypeNode(T)) {
      replaceNodeWithDebugPrint(node, T.getFullText());
      return;
    }

    // T = A | B | C
    // T = A & B & C
    if (
      T.isKind(tsm.SyntaxKind.UnionType) ||
      T.isKind(tsm.SyntaxKind.IntersectionType)
    ) {
      replaceNodeWithDebugPrint(node, T.getFullText());
      return;
    }

    return;
  }

  // DeepReadonly
  if (typeNameStr === options.DeepReadonly.typeName) {
    if (!Arr.isArrayOfLength1(typeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${typeArguments.length}" for Readonly.`,
      );
    }

    // Recursive processing
    transformNode(
      typeArguments[0],
      nextReadonlyContext({
        currentReadonlyContext: readonlyContext,
        nextReadonlyContextType: 'DeepReadonly',
      }),
      options,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const T = node.getTypeArguments()[0]!;

    // DeepReadonly<DeepReadonly<T>> -> DeepReadonly<T>
    if (readonlyContext.type === 'DeepReadonly') {
      replaceNodeWithDebugPrint(node, T.getFullText());
      return;
    }

    // Readonly<number> -> number
    if (isPrimitiveTypeNode(T)) {
      replaceNodeWithDebugPrint(node, T.getFullText());
      return;
    }

    // T = P[]
    // DeepReadonly<P[]> -> readonly P[] (for primitive type arrays, convert to readonly P[] form)
    // DeepReadonly<O[]> -> DeepReadonly<O[]> (for object type arrays, keep as is to recursively apply Readonly)
    // DeepReadonly<P[][]> -> DeepReadonly<P[][]>
    if (
      T.isKind(tsm.SyntaxKind.ArrayType) &&
      isPrimitiveTypeNode(T.getElementTypeNode())
    ) {
      replaceNodeWithDebugPrint(
        node,
        wrapWithParentheses(`readonly ${T.getFullText()}`),
      );
      return;
    }

    // T = [P1, P2, P3]
    // DeepReadonly<[P1, P2, P3]> -> readonly [P1, P2, P3]
    if (
      T.isKind(tsm.SyntaxKind.TupleType) &&
      T.getElements().every(isPrimitiveTypeNode)
    ) {
      replaceNodeWithDebugPrint(
        node,
        wrapWithParentheses(`readonly ${T.getFullText()}`),
      );
      return;
    }

    return;
  }

  {
    const nextReadonlyContextValue = nextReadonlyContext({
      currentReadonlyContext: readonlyContext,
      nextReadonlyContextType: 'none',
      indexedAccessDepthChange: 'keep',
    });

    // Recursive processing
    for (const t of node.getTypeArguments()) {
      transformNode(t, nextReadonlyContextValue, options);
    }
  }
};

/** `tr(E[]) |-> tr(E)[]` */
const transformArrayTypeNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.ArrayTypeNode,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  // Recursive processing
  transformNode(
    node.getElementTypeNode(),
    nextReadonlyContext({
      currentReadonlyContext: readonlyContext,
      nextReadonlyContextType: 'none',
      indexedAccessDepthChange: 'decr',
    }),
    options,
  );

  switch (readonlyContext.type) {
    case 'DeepReadonly':
    case 'readonly':
      return; // remain tr(E)[] as is

    // Unneceesary `Readonly` wrapper will be remove in transformTypeReferenceNode
    case 'Readonly':
    case 'none':
      if (readonlyContext.indexedAccessDepth === 0) {
        replaceNodeWithDebugPrint(
          node,
          wrapWithParentheses(`readonly ${node.getFullText()}`),
        );
      }
  }
};

/** `tr([E1, E2, E3])` |-> `[tr(E1), tr(E2), tr(E3)]` */
const transformTupleTypeNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TupleTypeNode,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  // Recursive processing
  {
    const nextReadonlyContextValue = nextReadonlyContext({
      currentReadonlyContext: readonlyContext,
      nextReadonlyContextType: 'none',
      indexedAccessDepthChange: 'decr',
    });

    for (const el of node.getElements()) {
      if (el.isKind(tsm.SyntaxKind.NamedTupleMember)) {
        if (options.ignoredPrefixes.every((p) => !el.getName().startsWith(p))) {
          transformNode(el.getTypeNode(), nextReadonlyContextValue, options);
        }
      } else {
        transformNode(el, nextReadonlyContextValue, options);
      }
    }
  }

  switch (readonlyContext.type) {
    case 'DeepReadonly':
    case 'readonly':
      return; // remain tr(E)[] as is

    // Unneceesary `Readonly` wrapper will be remove in transformTypeReferenceNode
    case 'Readonly':
    case 'none':
      if (readonlyContext.indexedAccessDepth === 0) {
        replaceNodeWithDebugPrint(
          node,
          wrapWithParentheses(`readonly ${node.getFullText()}`),
        );
      }
  }
};

/** `tr("...T")` |-> `...tr(T)` */
const transformRestTypeNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.RestTypeNode,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  // Recursive processing
  transformNode(
    node.getTypeNode() /* = T */,
    nextReadonlyContext({
      currentReadonlyContext: readonlyContext,
      nextReadonlyContextType: 'none',
      indexedAccessDepthChange: 'decr',
    }),
    options,
  );

  const R = removeParentheses(node.getTypeNode());

  // `tr("...readonly E[]") |-> ...tr(E)[]`
  // `tr("...readonly [E1, E2]") |-> ...[tr(E1), tr(E2)]`
  if (isReadonlyArrayTypeNode(R) || isReadonlyTupleTypeNode(R)) {
    replaceNodeWithDebugPrint(
      node,
      `...${R.getTypeNode().getFullText()}` /* = tr(E)[] or [tr(E1), tr(E2)] */,
    );
  }
};

/**
 * - `readonly T[][] |-> readonly (readonly T[])[]`
 * - `keyof { a: number[] } |-> keyof Readonly<{ a: readonly number[] }>`
 */
const transformTypeOperatorNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeOperatorTypeNode,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: SafeUintWithSmallInt }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  // Recursive processing
  transformNode(
    node.getTypeNode(),
    nextReadonlyContext({
      currentReadonlyContext: readonlyContext,
      nextReadonlyContextType:
        node.getOperator() === tsm.SyntaxKind.ReadonlyKeyword
          ? 'readonly'
          : 'none',
      indexedAccessDepthChange: 'decr',
    }),
    options,
  );

  switch (readonlyContext.type) {
    // DeepReadonly<readonly E[]> -> DeepReadonly<E[]>
    case 'DeepReadonly':
      replaceNodeWithDebugPrint(node, node.getTypeNode().getFullText());
      return;

    case 'Readonly':
    case 'none':
      if (readonlyContext.indexedAccessDepth > 0) {
        replaceNodeWithDebugPrint(node, node.getTypeNode().getFullText());
      }
  }
};

// `{ readonly member: V } |-> Readonly<{ member: V }>`
const transformTypeLiteralNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeLiteralNode,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: SafeUintWithSmallInt }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  if (options.ignoreEmptyObjectTypes && node.getMembers().length === 0) {
    return;
  }

  // Recursive processing
  transformMembers(
    node.getMembers(),
    'remove',
    nextReadonlyContext({
      currentReadonlyContext: readonlyContext,
      nextReadonlyContextType: 'none',
      indexedAccessDepthChange: 'decr',
    }),
    options,
  );

  switch (readonlyContext.type) {
    case 'DeepReadonly':
    case 'Readonly':
      // Don't wrap with Readonly if already readonly
      return;

    case 'none': {
      if (readonlyContext.indexedAccessDepth === 0) {
        // `{ readonly x: X, readonly y: Y } |-> Readonly<{ x: X, y: Y }>`
        replaceNodeWithDebugPrint(node, `Readonly<${node.getFullText()}>`);
      }
    }
  }
};

/** `tr([A, B, C][I])` |-> `[tr(A), tr(B), tr(C)][I]` */
const transformIndexedAccessTypeNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.IndexedAccessTypeNode,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  // Recursive processing
  transformNode(
    node.getObjectTypeNode(),
    nextReadonlyContext({
      currentReadonlyContext: readonlyContext,
      nextReadonlyContextType: 'none',
      indexedAccessDepthChange: 'incr',
    }),
    options,
  );

  transformNode(
    node.getIndexTypeNode() /* = I */,
    nextReadonlyContext({
      currentReadonlyContext: readonlyContext,
      nextReadonlyContextType: 'Readonly',
      indexedAccessDepthChange: 'decr',
    }),
    options,
  );
};

/**
 * - `{ [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 * - `{ -readonly [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 * - `{ readonly [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 * - `{ +readonly [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 */
const transformMappedTypeNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.MappedTypeNode,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: SafeUintWithSmallInt }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  const typeNode = node.getTypeNode();

  if (typeNode !== undefined) {
    transformNode(
      typeNode,
      nextReadonlyContext({
        currentReadonlyContext: readonlyContext,
        nextReadonlyContextType: 'none',
        indexedAccessDepthChange: 'decr',
      }),
      options,
    );
  }

  const questionTokenText =
    pipe(node.getQuestionToken()?.getText()).chainOptional((t) =>
      t === '?' ? '?' : t === '-' ? '-?' : t === '+' ? '+?' : undefined,
    ).value ?? '';

  const result: string = pipe(
    // remove readonlyToken
    `{ [${node.getTypeParameter().getFullText()}]${questionTokenText}: ${node.getTypeNode()?.getFullText()} }`,
  ).chain((mpt) =>
    strictMatch(readonlyContext.type, {
      // Don't wrap with Readonly if already readonly or unnecessary
      DeepReadonly: mpt,
      Readonly: mpt,
      none: readonlyContext.indexedAccessDepth > 0 ? mpt : `Readonly<${mpt}>`,
    }),
  ).value;

  replaceNodeWithDebugPrint(node, result);
};

// Making interface members readonly
const transformInterfaceDeclarationNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.InterfaceDeclaration,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  for (const param of node.getTypeParameters()) {
    transformNode(param, initialReadonlyContext, options);
  }

  for (const n of node.getHeritageClauses()) {
    transformNode(n, initialReadonlyContext, options);
  }

  transformMembers(node.getMembers(), 'add', initialReadonlyContext, options);
};

const transformClassDeclarationNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.ClassDeclaration,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  for (const n of node.getTypeParameters()) {
    transformNode(n, initialReadonlyContext, options);
  }

  for (const n of node.getHeritageClauses()) {
    transformNode(n, initialReadonlyContext, options);
  }

  for (const mb of node.getMembers()) {
    if (hasDisableNextLineComment(mb)) {
      console.debug('skipped member by disable-next-line comment');
      continue;
    }

    if (mb.isKind(tsm.SyntaxKind.PropertyDeclaration)) {
      if (!checkIfPropertyNameShouldBeIgnored(mb.getNameNode(), options)) {
        mb.setIsReadonly(true);

        const type = mb.getTypeNode();
        if (type !== undefined) {
          transformNode(type, initialReadonlyContext, options);
        }

        const initializer = mb.getInitializer();
        if (initializer !== undefined) {
          transformNode(initializer, initialReadonlyContext, options);
        }
      }

      continue;
    }

    transformNode(mb, initialReadonlyContext, options);
  }

  for (const mb of node.getChildrenOfKind(tsm.SyntaxKind.IndexSignature)) {
    transformIndexSignatureDeclaration(
      mb,
      'add',
      initialReadonlyContext,
      options,
    );
  }

  for (const ctor of node.getConstructors()) {
    for (const param of ctor.getParameters()) {
      if (hasDisableNextLineComment(param)) {
        console.debug(
          'skipped class constructor parameter by disable-next-line comment',
        );
        continue;
      }
      {
        const name = (param satisfies tsm.ParameterDeclaration).getName();

        if (options.ignoredPrefixes.some((p) => name.startsWith(p))) {
          continue;
        }
      }

      // Check if parameter is a property declaration (public/protected/private)
      const scope = param.getScope();

      // public -> public readonly
      // protected -> protected readonly
      // private -> private readonly
      if (
        scope === tsm.Scope.Public ||
        scope === tsm.Scope.Protected ||
        scope === tsm.Scope.Private
      ) {
        param.setIsReadonly(true);
      }

      const type = param.getTypeNode();
      if (type !== undefined) {
        transformNode(type, initialReadonlyContext, options);
      }
    }

    const body = ctor.getBody();
    if (body !== undefined) {
      transformNode(body, initialReadonlyContext, options);
    }
    continue;
  }
};

/**
 * - `tr(A & B) -> tr(A) & tr(B)`
 * - `tr(Readonly<A> & Readonly<B>) -> Readonly<tr(A) & tr(B)>`
 */
const transformIntersectionTypeNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.IntersectionTypeNode,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: SafeUintWithSmallInt }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  transformUnionOrIntersectionTypeNodeImpl(node, readonlyContext, options, '&');
};

/**
 * - `tr(A | B) |-> tr(A) | tr(B)`
 * - `tr(Readonly<A> | Readonly<B>) |-> Readonly<tr(A) | tr(B)>`
 */
const transformUnionTypeNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.UnionTypeNode,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: SafeUintWithSmallInt }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  transformUnionOrIntersectionTypeNodeImpl(node, readonlyContext, options, '|');
};

const transformUnionOrIntersectionTypeNodeImpl = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.IntersectionTypeNode | tsm.UnionTypeNode,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: SafeUintWithSmallInt }>
  >,
  options: ReadonlyTransformerOptionsInternal,
  operator: '&' | '|',
): void => {
  const nextReadonlyContextValue = nextReadonlyContext({
    currentReadonlyContext: readonlyContext,
    nextReadonlyContextType: 'none',
    indexedAccessDepthChange: 'keep',
  });

  // Recursive processing
  for (const n of node.getTypeNodes() /* = [A, B] */) {
    transformNode(n, nextReadonlyContextValue, options);
  }

  const newTypes = node.getTypeNodes();

  const { primitives, arraysAndTuples, typeLiterals, others } =
    groupUnionIntersectionTypes(newTypes);

  console.debug({ primitives, arraysAndTuples, typeLiterals, others });

  const typeLiteralsWrappedWithReadonly: readonly [] | readonly [string] =
    typeLiterals === undefined
      ? []
      : [
          unionToString({
            types: typeLiterals.nodes.map((n) =>
              isReadonlyTypeReferenceNode(n)
                ? // NOTE: Readonly<A & B> -> (A & B)
                  unwrapReadonlyTypeArgText(n)
                : (n satisfies tsm.TypeLiteralNode).getFullText(),
            ),
            op: operator,
            wrapWithReadonly:
              nextReadonlyContextValue.type !== 'DeepReadonly' &&
              nextReadonlyContextValue.indexedAccessDepth === 0,
          }),
        ];

  // Sort by first occurrence (preserving the original union order as much as possible)
  const sorted: readonly string[] = [
    mapOptional(
      primitives,
      (a) => [a.nodes.map((n) => n.getFullText()), a.firstPosition] as const,
    ),
    mapOptional(
      arraysAndTuples,
      (a) => [a.nodes.map((n) => n.getFullText()), a.firstPosition] as const,
    ),
    mapOptional(
      typeLiterals,
      (a) => [typeLiteralsWrappedWithReadonly, a.firstPosition] as const,
    ),
    mapOptional(
      others,
      (a) =>
        [
          a.nodes.map((n) => wrapWithParentheses(n.getFullText())),
          a.firstPosition,
        ] as const,
    ),
  ]
    .filter((x) => x !== undefined)
    .toSorted((a, b) => a[1] - b[1])
    .flatMap((a) => a[0]);

  // Readonly<number & { x: X } & { y: Y } & readonly E[]>
  // -> number & readonly E[] & Readonly<{ x: X } & { y: Y }>

  // Readonly<number | { x: X } | { y: Y } | readonly E[]>
  // -> number | readonly E[] | Readonly<{ x: X } | { y: Y }>
  replaceNodeWithDebugPrint(
    node,
    unionToString({ types: sorted, op: operator, wrapWithReadonly: false }),
  );
};

const unionToString = ({
  types,
  op,
  wrapWithReadonly,
}: Readonly<{
  types: readonly string[];
  op: '&' | '|';
  wrapWithReadonly: boolean | string;
}>): string =>
  types.length === 0
    ? 'never'
    : Arr.isArrayOfLength1(types)
      ? wrapWithReadonly === false
        ? wrapWithParentheses(types[0])
        : `${isString(wrapWithReadonly) ? wrapWithReadonly : 'Readonly'}<${types[0]}>`
      : wrapWithReadonly === false
        ? wrapWithParentheses(types.join(` ${op} `))
        : `${isString(wrapWithReadonly) ? wrapWithReadonly : 'Readonly'}<${types.join(` ${op} `)}>`;

/** Convert ((T)) -> (T) recursively */
const transformParenthesizedTypeNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.ParenthesizedTypeNode,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  const typeNode = node.getTypeNode();

  if (typeNode.isKind(tsm.SyntaxKind.ParenthesizedType)) {
    // Recursive processing
    transformParenthesizedTypeNode(typeNode, readonlyContext, options);
  }

  transformNode(node.getTypeNode(), readonlyContext, options);

  const T = node.getTypeNode();

  if (
    // remove () if T is TypeReferenceNode
    // e.g. `(Readonly<A>) |-> Readonly<A>`
    T.isKind(tsm.SyntaxKind.TypeReference) ||
    // remove () if T is ArrayTypeNode
    // e.g. `(A[]) |-> A[]`
    T.isKind(tsm.SyntaxKind.ArrayType) ||
    // remove () if T is TupleTypeNode
    // e.g. `([A]) |-> [A]`
    T.isKind(tsm.SyntaxKind.TupleType) ||
    // remove () if T is PrimitiveTypeNode
    // e.g. `(number) |-> number`
    isPrimitiveTypeNode(T) ||
    // remove () if T is TypeLiteralNode
    // e.g. `({ member: V }) |-> { member: V }`
    T.isKind(tsm.SyntaxKind.TypeLiteral)
  ) {
    replaceNodeWithDebugPrint(node, T.getFullText());
  }
};

/**
 * `tr(["member1: V1", "member2: V2", "member3: V3"])`
 *
 * -> `["member1: tr(V1)", "member2: tr(V2)", "member3: tr(V3)"]`
 */
const transformMembers = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  members: readonly tsm.TypeElementTypes[],
  readonlyModifier: 'add' | 'remove',
  readonlyContext: Extract<
    ReadonlyContext,
    Readonly<{
      type: 'DeepReadonly' | 'none';
      indexedAccessDepth: SafeUintWithSmallInt;
    }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  for (const mb of members) {
    if (hasDisableNextLineComment(mb)) {
      console.debug('skipped by member disable-next-line comment');
      continue;
    }

    if (mb.isKind(tsm.SyntaxKind.PropertySignature)) {
      if (!checkIfPropertyNameShouldBeIgnored(mb.getNameNode(), options)) {
        transformPropertySignature(
          mb,
          readonlyModifier,
          readonlyContext,
          options,
        );
      }
      continue;
    }

    if (mb.isKind(tsm.SyntaxKind.IndexSignature)) {
      transformIndexSignatureDeclaration(
        mb,
        readonlyModifier,
        readonlyContext,
        options,
      );
      continue;
    }

    transformNode(mb, readonlyContext, options);
    continue;
  }
};

const transformPropertySignature = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.PropertySignature,
  readonlyModifier: 'add' | 'remove',
  readonlyContext: Extract<
    ReadonlyContext,
    Readonly<{
      type: 'DeepReadonly' | 'none';
      indexedAccessDepth: SafeUintWithSmallInt;
    }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  if (
    readonlyContext.type === 'DeepReadonly' ||
    readonlyModifier === 'remove'
  ) {
    node.setIsReadonly(false);
  } else {
    node.setIsReadonly(true);
  }

  {
    const type = node.getTypeNode();

    if (type !== undefined) {
      transformNode(type, readonlyContext, options);
    }
  }
};

const transformIndexSignatureDeclaration = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.IndexSignatureDeclaration,
  readonlyModifier: 'add' | 'remove',
  readonlyContext: Extract<
    ReadonlyContext,
    Readonly<{
      type: 'DeepReadonly' | 'none';
      indexedAccessDepth: SafeUintWithSmallInt;
    }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  if (hasDisableNextLineComment(node)) {
    console.debug('skipped index signature by disable-next-line comment');
    return;
  }

  if (
    readonlyContext.type === 'DeepReadonly' ||
    readonlyModifier === 'remove'
  ) {
    // node.setIsReadonly(false);
    node.toggleModifier('readonly', false);
  } else {
    node.toggleModifier('readonly', true);
    // node.setIsReadonly(true);
  }

  {
    const key = node.getKeyTypeNode();
    transformNode(key, readonlyContext, options);
  }
  {
    const ret = node.getReturnTypeNode();
    if (ret !== undefined) {
      transformNode(ret, readonlyContext, options);
    }
  }
};

const checkIfPropertyNameShouldBeIgnored = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  nameNode: tsm.PropertyName,
  options: ReadonlyTransformerOptionsInternal,
): boolean => {
  expectType<typeof nameNode, tsm.PropertyName>('=');

  expectType<
    tsm.PropertyName,
    | tsm.NumericLiteral // skip
    | tsm.BigIntLiteral // skip
    | tsm.NoSubstitutionTemplateLiteral // invalid syntax
    | tsm.Identifier // mut_x: number[]
    | tsm.StringLiteral // "mut_x": number[]
    | tsm.PrivateIdentifier // #memberName: number[] (class only)
    | tsm.ComputedPropertyName // [`mut_x`]: number[]
  >('=');

  return (
    (nameNode.isKind(tsm.SyntaxKind.Identifier) &&
      pipe(nameNode.getText()).chain((nm) =>
        options.ignoredPrefixes.some((p) => nm.startsWith(p)),
      ).value) ||
    (nameNode.isKind(tsm.SyntaxKind.StringLiteral) &&
      pipe(nameNode.getLiteralValue()).chain((nm) =>
        options.ignoredPrefixes.some((p) => nm.startsWith(p)),
      ).value) ||
    (nameNode.isKind(tsm.SyntaxKind.PrivateIdentifier) &&
      pipe(nameNode.getText()).chain((nm) =>
        options.ignoredPrefixes.some((p) => nm.startsWith(`#${p}`)),
      ).value) ||
    (nameNode.isKind(tsm.SyntaxKind.ComputedPropertyName) &&
      pipe(nameNode.getExpression()).chain((exp) => {
        if (exp.isKind(tsm.SyntaxKind.StringLiteral)) {
          const nm = exp.getLiteralValue();
          return options.ignoredPrefixes.some((p) => nm.startsWith(p));
        }
        return false;
      }).value)
  );
};
