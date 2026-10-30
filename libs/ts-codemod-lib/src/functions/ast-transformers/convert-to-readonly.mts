import {
  Arr,
  expectType,
  ISet,
  isRecord,
  isString,
  mapNullable,
  match,
  pipe,
} from 'ts-data-forge';
import * as tsm from 'ts-morph';
import type {
  DeepReadonly,
  SafeUintWithSmallInt,
  StrictExclude,
  StrictExtract,
} from 'ts-type-forge';
import { DEFAULT_MUTABLE_PREFIXES } from '../constants/index.mjs';
import {
  hasCallOrConstructSignature,
  hasDisableNextLineComment,
  isAtomicTypeNode,
  isConditionalTypeDistributionGuard,
  isReadonlyArrayTypeNode,
  isReadonlyTupleOrArrayTypeNode,
  isReadonlyTupleTypeNode,
  isReadonlyTypeReferenceNode,
  removeParentheses,
  shouldAvoidParenthesesForReadonly,
  unwrapReadonlyTypeArgText,
  wrapWithParentheses,
  type ReadonlyTypeReferenceNode,
} from '../functions/index.mjs';
import {
  replaceNodeWithDebugPrint,
  replaceNodeWithText,
} from '../utils/index.mjs';
import {
  groupUnionIntersectionTypes,
  invalidDeepReadonlyTypeName,
  isMergeableReadonlyTypeReferenceNode,
  nextReadonlyContext,
  type ReadonlyContext,
} from './readonly-transformer-helpers/index.mjs';
import type { TsMorphTransformer } from './types.mjs';

const TRANSFORMER_NAME = 'convert-to-readonly';

export const convertToReadonlyTransformer = (
  options?: ReadonlyTransformerOptions,
): TsMorphTransformer => {
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

  // Removed in 4.0.0; a caller without types would otherwise lose it silently.
  const untypedOptions: unknown = options;

  if (
    isRecord(untypedOptions) &&
    untypedOptions['ignorePrefixes'] !== undefined
  ) {
    throw new Error(
      `The "ignorePrefixes" option of ${TRANSFORMER_NAME} was replaced by "mutableVariablePrefixes" and "mutablePropertyPrefixes".`,
    );
  }

  const optionsInternal: ReadonlyTransformerOptionsInternal = {
    DeepReadonly: {
      typeName: DeepReadonlyTypeName,
      applyLevel: 'keep',
    },
    ignoreEmptyObjectTypes: options?.ignoreEmptyObjectTypes ?? true,
    mutableVariablePrefixes: ISet.create(
      options?.mutableVariablePrefixes ?? DEFAULT_MUTABLE_PREFIXES,
    ),
    mutablePropertyPrefixes: ISet.create(
      options?.mutablePropertyPrefixes ?? DEFAULT_MUTABLE_PREFIXES,
    ),
    recordStyle: options?.recordStyle ?? 'ReadonlyRecord',
    debugPrint: options?.debug === true ? console.debug : () => {},
    replaceNode:
      options?.debug === true
        ? replaceNodeWithDebugPrint
        : (node, newNodeText) => replaceNodeWithText(node, newNodeText),
  } as const;

  return {
    name: TRANSFORMER_NAME,
    transform: (sourceAst) => {
      for (const node of sourceAst.getChildren()) {
        transformNode(node, initialReadonlyContext, optionsInternal);
      }
    },
  };
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
     * If `applyLevel` is `"applyAggressively"`, it applies `DeepReadonly` to all
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
    // applyLevel?: 'applyAggressively' | 'keep' | 'removeAsPossible';
  };

  /**
   * Ignore the readonly conversion for `{}`.
   *
   * @default true
   */
  ignoreEmptyObjectTypes?: boolean;

  /**
   * Prefixes of the names of variables, parameters (but for a constructor
   * parameter property, which `mutablePropertyPrefixes` decides), functions,
   * type aliases, interfaces and classes that are left mutable: their types
   * are not made readonly.
   *
   * @default ['mut_']
   */
  mutableVariablePrefixes?: string[];

  /**
   * Prefixes of the names of properties, methods and accessors (of type
   * literals, interfaces and classes, constructor parameter properties
   * included) that are left mutable: they get no `readonly`, and their types
   * are not made readonly. A private name is matched with or after its `#`, so
   * both `mut_` and `#mut_` cover `#mut_x`. Of a named tuple member with such a prefix, only the type
   * is kept; the tuple is still made `readonly`.
   *
   * A type literal with a property, a method or an accessor of such a prefix
   * is not wrapped with `Readonly<...>`, which would make that member readonly
   * too; its other members are marked `readonly` one by one instead, and a
   * `Readonly<...>` written around it is taken off. It is wrapped as before
   * when it also has a member that cannot be marked `readonly` by itself (a
   * method signature or an accessor without such a prefix, or a property or
   * index signature not yet `readonly` that an ignore comment skips), or when
   * it is a member of a `Readonly<...>` intersection beside a type that may be
   * an array.
   *
   * @default ['mut_']
   */
  mutablePropertyPrefixes?: string[];

  /**
   * The output style used when making `Record<K, V>` readonly.
   *
   * - `"ReadonlyRecord"`: Uses the `ReadonlyRecord` type utility provided by
   *   `ts-type-forge` (as the `ts-type-forge/prefer-readonly-or-mutable-record`
   *   ESLint rule suggests). Occurrences of `Readonly<Record<K, V>>` are also
   *   unified to `ReadonlyRecord<K, V>`. Note that no import statement is
   *   added, so `ReadonlyRecord` has to be available in the transformed code
   *   (e.g. globally via `ts-type-forge`'s `global.d.mts`).
   * - `"Readonly<Record>"`: Uses only built-in utility types
   *   (`Readonly<Record<K, V>>`). Occurrences of `ReadonlyRecord<K, V>` are
   *   also unified to `Readonly<Record<K, V>>`.
   *
   * Whichever style is selected, redundant wrappers such as
   * `Readonly<ReadonlyRecord<K, V>>` are normalized to that style as well.
   *
   * @default 'ReadonlyRecord'
   */
  recordStyle?: 'Readonly<Record>' | 'ReadonlyRecord';

  debug?: boolean;
}>;

type ReadonlyTransformerOptionsInternal = Readonly<{
  DeepReadonly: Readonly<{
    typeName: string;

    // removeAsPossible: 正規化後、 DeepReadonly の子ノードが typeLiteral かまたはその union or intersection であり、 それぞれの TypeLiteral がプリミティブ値のメンバーしか持たない場合。
    applyLevel: 'applyAggressively' | 'keep' | 'removeAsPossible';
  }>;

  ignoreEmptyObjectTypes: boolean;

  mutableVariablePrefixes: ISet<string>;

  mutablePropertyPrefixes: ISet<string>;

  recordStyle: 'Readonly<Record>' | 'ReadonlyRecord';

  debugPrint: (...args: readonly unknown[]) => void;
  replaceNode: (node: tsm.Node, newNodeText: string) => void;
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
    options.debugPrint();

    options.debugPrint(`transformNode [${node.getKindName()}] `);

    options.debugPrint(node.getFullText());

    options.debugPrint({ readonlyContext });

    options.debugPrint();
  }

  if (hasDisableNextLineComment(node, TRANSFORMER_NAME)) {
    options.debugPrint('skipped by disable-next-line comment');

    return;
  }

  // check for mutableVariablePrefixes
  if (node.isKind(tsm.SyntaxKind.VariableDeclaration)) {
    const nodeName = node.getName();

    if (options.mutableVariablePrefixes.some((p) => nodeName.startsWith(p))) {
      // Skip conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without appending `as const`
      options.debugPrint(
        'skipped variable declaration by mutableVariablePrefixes',
      );

      return;
    }

    // TODO: Support mutableVariablePrefixes in ArrayBindingPattern
    // if (ts.isArrayBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }

    // TODO: Support mutableVariablePrefixes in ObjectBindingPattern
    // if (ts.isObjectBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }
  }

  // Skip readonly conversion for function declarations with ignored prefixes
  // Example: function mut_foo() {} -> parameters and return types remain as is
  if (
    (node.isKind(tsm.SyntaxKind.FunctionDeclaration) ||
      node.isKind(tsm.SyntaxKind.FunctionExpression)) &&
    options.mutableVariablePrefixes.some(
      (p) => node.getName()?.startsWith(p) === true,
    )
  ) {
    return;
  }

  if (node.isKind(tsm.SyntaxKind.Parameter)) {
    const nodeName = node.getName();

    if (
      mutablePrefixesOfParameter(node, options).some((p) =>
        nodeName.startsWith(p),
      )
    ) {
      // Skip readonly conversion for parameters with mutable prefixes
      // Example: (mut_foo: string[]) => {} -> remains as is, without readonly conversion
      return;
    }

    // TODO: Support mutableVariablePrefixes in ArrayBindingPattern
    // if (ts.isArrayBindingPattern(nodeName)) {
    // }

    // TODO: Support mutableVariablePrefixes in ObjectBindingPattern
    // if (ts.isObjectBindingPattern(nodeName)) {
    // }
  }

  // Skip readonly conversion for type alias declarations with ignored prefixes
  // Example: type mut_Foo = number[]; -> remains as number[] without readonly
  if (
    node.isKind(tsm.SyntaxKind.TypeAliasDeclaration) &&
    options.mutableVariablePrefixes.some((p) => node.getName().startsWith(p))
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
        'Invalid readonlyContext "readonly" passed to TypeLiteralNode',
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
    if (
      options.mutableVariablePrefixes.some((p) => node.getName().startsWith(p))
    ) {
      return;
    }

    transformInterfaceDeclarationNode(node, options);

    return;
  }

  if (node.isKind(tsm.SyntaxKind.ClassDeclaration)) {
    // Skip readonly conversion for class declarations with ignored prefixes
    // Example: class mut_Class {...} -> properties remain without readonly
    if (
      options.mutableVariablePrefixes.some(
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
 * - `tr(Readonly<{ mut_x: X; y: Y }>) |-> { mut_x: X; readonly y: tr(Y) }` (see
 *   `isLeftUnwrapped`)
 * - `tr(Readonly<E[]>) |-> readonly tr(E)[]`
 * - `tr(Readonly<[E1, E2, E3]>) |-> readonly [tr(E1), tr(E2), tr(E3)]`
 * - `tr(Readonly<readonly E[]>) |-> readonly tr(E)[]`
 * - `tr(Readonly<readonly [E1, E2, E3]>) |-> readonly [tr(E1), tr(E2), tr(E3)]`
 * - `tr(Readonly<A | readonly E[]>) |-> Readonly<tr(A)> | readonly tr(E)[]>`
 * - `tr(Record<K, V>) |-> Readonly<Record<tr(K), tr(V)>>` (or
 *   `ReadonlyRecord<tr(K), tr(V)>`, depending on the `recordStyle` option;
 *   `Readonly<Record<K, V>>`, `ReadonlyRecord<K, V>` and
 *   `Readonly<ReadonlyRecord<K, V>>` are unified to the same style)
 */
const transformTypeReferenceNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeReferenceNode,
  readonlyContext: StrictExclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: SafeUintWithSmallInt }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  const typeNameStr = node.getTypeName().getText();

  const typeArguments = node.getTypeArguments();

  // Array<T> / ReadonlyArray<T> to readonly T[]
  if (typeNameStr === 'Array' || typeNameStr === 'ReadonlyArray') {
    if (!Arr.isFixedLengthArray(1, typeArguments)) {
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

    options.replaceNode(
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
    if (!Arr.isFixedLengthArray(1, typeArguments)) {
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

    options.replaceNode(node, `ReadonlySet<${T.getFullText()}>`);

    return;
  }

  // Map<T> to ReadonlyMap<T>
  if (typeNameStr === 'Map') {
    if (!Arr.isFixedLengthArray(2, typeArguments)) {
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

    options.replaceNode(
      node,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      `ReadonlyMap<${K!.getFullText()}, ${V!.getFullText()}>`,
    );

    return;
  }

  // Record<K, V> to ReadonlyRecord<K, V> / Readonly<Record<K, V>>
  if (typeNameStr === 'Record') {
    if (!Arr.isFixedLengthArray(2, typeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${typeArguments.length}" for Record.`,
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

    // The bare Record is kept as is in the following cases:
    // - DeepReadonly<Record<K, V>> already applies readonly recursively.
    // - Readonly<Record<K, V>> is unified to the configured record style by
    //   the surrounding `Readonly` handler.
    // - Record<K, V>[I] does not need readonly, just like
    //   `Readonly<{ ... }>[I] -> { ... }[I]`.
    if (
      readonlyContext.type === 'none' &&
      readonlyContext.indexedAccessDepth === 0
    ) {
      const [K, V] = node.getTypeArguments();

      options.replaceNode(
        node,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        readonlyRecordText(K!.getFullText(), V!.getFullText(), options),
      );
    }

    return;
  }

  // Unify ReadonlyRecord<K, V> to the configured record style
  if (typeNameStr === 'ReadonlyRecord') {
    if (!Arr.isFixedLengthArray(2, typeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${typeArguments.length}" for ReadonlyRecord.`,
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

    const bareRecordText =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      `Record<${K!.getFullText()}, ${V!.getFullText()}>` as const;

    // Readonly<ReadonlyRecord<K, V>> -> Readonly<Record<K, V>>
    //   (the surrounding `Readonly` handler then unifies it to the configured
    //   record style, so the bare Record never survives into the output)
    if (
      readonlyContext.type === 'Readonly' &&
      readonlyContext.indexedAccessDepth === 0
    ) {
      options.replaceNode(node, bareRecordText);

      return;
    }

    if (options.recordStyle === 'Readonly<Record>') {
      // The ReadonlyRecord name is eliminated everywhere:
      // - DeepReadonly<ReadonlyRecord<K, V>> -> DeepReadonly<Record<K, V>>
      // - ReadonlyRecord<K, V>[I] -> Record<K, V>[I]
      //   (readonly is unnecessary under indexed access, as with
      //   Readonly<{ ... }>[I] -> { ... }[I])
      if (
        readonlyContext.type !== 'none' ||
        readonlyContext.indexedAccessDepth > 0
      ) {
        options.replaceNode(node, bareRecordText);

        return;
      }

      options.replaceNode(node, `Readonly<${bareRecordText}>`);

      return;
    }

    // With `recordStyle: "ReadonlyRecord"`, ReadonlyRecord is already the
    // configured style. It is deliberately kept even under DeepReadonly or an
    // indexed access — stripping it to the bare built-in `Record` there would
    // conflict with the `ts-type-forge/prefer-readonly-or-mutable-record`
    // ESLint rule.
    return;
  }

  // remove unnecessary `Readonly` wrapper or convert to readonly operator
  if (typeNameStr === 'Readonly') {
    if (!Arr.isFixedLengthArray(1, typeArguments)) {
      throw new Error(
        `Unexpected number of type arguments "${typeArguments.length}" for Readonly.`,
      );
    }

    // Read before the recursion, which may replace the node.
    const typeArgumentBefore = removeParentheses(typeArguments[0]);

    // Readonly<{ mut_x: X; y: Y }> -> { mut_x: X; readonly y: Y }
    // `Readonly` would make the property of an ignored prefix readonly too, so
    // it is taken off, and the literal is transformed where nothing wraps it,
    // which marks its other members readonly in place. See `takesOffReadonly`.
    const takesOffWrapper =
      readonlyContext.type !== 'DeepReadonly' &&
      readonlyContext.indexedAccessDepth === 0 &&
      typeArgumentBefore.isKind(tsm.SyntaxKind.TypeLiteral) &&
      takesOffReadonly(typeArgumentBefore, options);

    // Recursive processing
    transformNode(
      typeArguments[0],
      takesOffWrapper
        ? initialReadonlyContext
        : nextReadonlyContext({
            currentReadonlyContext: readonlyContext,
            nextReadonlyContextType: 'Readonly',
            indexedAccessDepthChange: 'keep',
          }),
      options,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const typeArgument = node.getTypeArguments()[0]!;

    const T = removeParentheses(typeArgument);

    // The comments in front of the type argument and inside its parentheses,
    // which `T.getFullText()` would leave behind with the parentheses.
    const commentsInFrontOfT = commentsBetween(
      node.getSourceFile(),
      typeArgument.getPos(),
      T.getStart(),
    );

    const TText = `${commentsInFrontOfT}${T.getText()}` as const;

    // `T` with the parentheses that `Readonly<...>` made unnecessary and its
    // position may need (`Readonly<A | B>[]` -> `(A | B)[]`).
    const unwrappedText =
      T.isKind(tsm.SyntaxKind.UnionType) ||
      T.isKind(tsm.SyntaxKind.IntersectionType)
        ? wrapWithParentheses(TText)
        : TText;

    // DeepReadonly<Readonly<T>> -> DeepReadonly<T>
    if (readonlyContext.type === 'DeepReadonly') {
      options.replaceNode(node, unwrappedText);

      return;
    }

    // Readonly<{ ... }>[I] -> { ... }[I]
    if (readonlyContext.indexedAccessDepth > 0) {
      options.replaceNode(node, unwrappedText);

      return;
    }

    // Readonly<Readonly<{ mut_x: X }>> -> { mut_x: X } as well: the inner
    // `Readonly` has already been taken off the literal.
    if (
      takesOffWrapper ||
      (T.isKind(tsm.SyntaxKind.TypeLiteral) && takesOffReadonly(T, options))
    ) {
      // The comments after the literal, which nothing else carries over, go
      // in front of it: a line comment after it would end the type with a
      // line break, which a following `[]` cannot be parsed across.
      const commentsAfterT = commentsBetween(
        node.getSourceFile(),
        T.getEnd(),
        node.getEnd(),
      );

      options.replaceNode(
        node,
        `${commentsInFrontOfT}${commentsAfterT}${T.getText()}`,
      );

      return;
    }

    // Readonly<Readonly<T>> -> Readonly<T>
    if (isReadonlyTypeReferenceNode(T)) {
      options.replaceNode(node, TText);

      return;
    }

    // Readonly<DeepReadonly<T>> -> DeepReadonly<T>
    if (
      getDeepReadonlyTypeArg(T, options.DeepReadonly.typeName) !== undefined
    ) {
      options.replaceNode(node, TText);

      return;
    }

    // Readonly<number> -> number
    if (isAtomicTypeNode(T)) {
      options.replaceNode(node, TText);

      return;
    }

    // Readonly<Record<K, V>> -> the configured record style
    // (`ReadonlyRecord<K, V>` or `Readonly<Record<K, V>>` as is)
    if (
      T.isKind(tsm.SyntaxKind.TypeReference) &&
      T.getTypeName().getText() === 'Record'
    ) {
      const recordTypeArguments = T.getTypeArguments();

      if (Arr.isFixedLengthArray(2, recordTypeArguments)) {
        options.replaceNode(
          node,
          `${commentsInFrontOfT}${readonlyRecordText(
            recordTypeArguments[0].getFullText(),
            recordTypeArguments[1].getFullText(),
            options,
          )}`,
        );

        return;
      }
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
      const readonlyText = `readonly ${TText}` as const;

      options.replaceNode(
        node,
        shouldAvoidParenthesesForReadonly(node)
          ? readonlyText
          : wrapWithParentheses(readonlyText),
      );

      return;
    }

    // T = readonly E[] or readonly [E1, E2, E3]
    // Readonly<readonly E[]> -> readonly E[]
    // Readonly<readonly [E1, E2, E3]> -> readonly [E1, E2, E3]
    if (isReadonlyTupleOrArrayTypeNode(T)) {
      options.replaceNode(node, TText);

      return;
    }

    // T = A | B | C
    // T = A & B & C
    //
    // The union or intersection has already put back under `Readonly` every
    // member that still needs it, so this one is redundant.
    if (
      T.isKind(tsm.SyntaxKind.UnionType) ||
      T.isKind(tsm.SyntaxKind.IntersectionType)
    ) {
      options.replaceNode(node, unwrappedText);

      return;
    }

    return;
  }

  // DeepReadonly
  if (typeNameStr === options.DeepReadonly.typeName) {
    if (!Arr.isFixedLengthArray(1, typeArguments)) {
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
      options.replaceNode(node, T.getFullText());

      return;
    }

    // Readonly<number> -> number
    if (isAtomicTypeNode(T)) {
      options.replaceNode(node, T.getFullText());

      return;
    }

    // T = P[]
    // DeepReadonly<P[]> -> readonly P[] (for primitive type arrays, convert to readonly P[] form)
    // DeepReadonly<O[]> -> DeepReadonly<O[]> (for object type arrays, keep as is to recursively apply Readonly)
    // DeepReadonly<P[][]> -> DeepReadonly<P[][]>
    if (
      T.isKind(tsm.SyntaxKind.ArrayType) &&
      isAtomicTypeNode(T.getElementTypeNode())
    ) {
      const readonlyText = `readonly ${T.getFullText()}` as const;

      options.replaceNode(
        node,
        shouldAvoidParenthesesForReadonly(node)
          ? readonlyText
          : wrapWithParentheses(readonlyText),
      );

      return;
    }

    // T = [P1, P2, P3]
    // DeepReadonly<[P1, P2, P3]> -> readonly [P1, P2, P3]
    if (
      T.isKind(tsm.SyntaxKind.TupleType) &&
      T.getElements().every(isAtomicTypeNode)
    ) {
      const readonlyText = `readonly ${T.getFullText()}` as const;

      options.replaceNode(
        node,
        shouldAvoidParenthesesForReadonly(node)
          ? readonlyText
          : wrapWithParentheses(readonlyText),
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

/** Renders a readonly `Record<K, V>` in the configured record style. */
const readonlyRecordText = (
  keyText: string,
  valueText: string,
  options: ReadonlyTransformerOptionsInternal,
): string =>
  options.recordStyle === 'ReadonlyRecord'
    ? (`ReadonlyRecord<${keyText}, ${valueText}>` as const)
    : (`Readonly<Record<${keyText}, ${valueText}>>` as const);

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

    // Unnecessary `Readonly` wrapper will be remove in transformTypeReferenceNode
    case 'Readonly':
    case 'none':
      // Skip the `A[] extends B[] ? ...` union-distribution-guard idiom: adding
      // `readonly` there does not improve immutability and breaks the idiom.
      if (
        readonlyContext.indexedAccessDepth === 0 &&
        !isConditionalTypeDistributionGuard(node)
      ) {
        const readonlyText = `readonly ${node.getText()}` as const;

        options.replaceNode(
          node,
          shouldAvoidParenthesesForReadonly(node)
            ? readonlyText
            : wrapWithParentheses(readonlyText),
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
        if (
          options.mutablePropertyPrefixes.every(
            (p) => !el.getName().startsWith(p),
          )
        ) {
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

    // Unnecessary `Readonly` wrapper will be remove in transformTypeReferenceNode
    case 'Readonly':
    case 'none':
      // Skip the `[A] extends [B] ? ...` union-distribution-guard idiom: adding
      // `readonly` there does not improve immutability and breaks the idiom.
      if (
        readonlyContext.indexedAccessDepth === 0 &&
        !isConditionalTypeDistributionGuard(node)
      ) {
        const readonlyText = `readonly ${node.getText()}` as const;

        options.replaceNode(
          node,
          shouldAvoidParenthesesForReadonly(node)
            ? readonlyText
            : wrapWithParentheses(readonlyText),
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
  if (!isReadonlyArrayTypeNode(R) && !isReadonlyTupleTypeNode(R)) {
    return;
  }

  // The comments in front of `R` and inside the parentheses around it, which
  // `R.getTypeNode().getFullText()` does not reach.
  const commentsInFrontOfR = commentsBetween(
    node.getSourceFile(),
    node.getTypeNode().getPos(),
    R.getStart(),
  );

  options.replaceNode(
    node,
    `...${commentsInFrontOfR}${R.getTypeNode().getFullText()}` /* = tr(E)[] or [tr(E1), tr(E2)] */,
  );
};

/**
 * - `readonly T[][] |-> readonly (readonly T[])[]`
 * - `keyof { a: number[] } |-> keyof Readonly<{ a: readonly number[] }>`
 */
const transformTypeOperatorNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeOperatorTypeNode,
  readonlyContext: StrictExclude<
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
      options.replaceNode(node, node.getTypeNode().getFullText());

      return;

    case 'Readonly':
    case 'none':
      if (readonlyContext.indexedAccessDepth > 0) {
        options.replaceNode(node, node.getTypeNode().getFullText());
      }
  }
};

// `{ readonly member: V } |-> Readonly<{ member: V }>`
const transformTypeLiteralNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeLiteralNode,
  readonlyContext: StrictExclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: SafeUintWithSmallInt }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  if (options.ignoreEmptyObjectTypes && Arr.isEmpty(node.getMembers())) {
    return;
  }

  // Whether this position is one where the literal is wrapped at all — a
  // context that already carries `Readonly` or `DeepReadonly` does it, and
  // inside an indexed access the modifier makes no difference to the result.
  const wrappingApplies =
    readonlyContext.type === 'none' && readonlyContext.indexedAccessDepth === 0;

  // A call or construct signature does not survive `Readonly<T>`, and a
  // property of an ignored prefix (`mut_`) must stay mutable, so a literal
  // carrying either is left unwrapped and marked readonly member by member
  // instead. See `hasCallOrConstructSignature` and `isLeftUnwrapped`.
  const skipWrapping =
    wrappingApplies &&
    (hasCallOrConstructSignature(node) || isLeftUnwrapped(node, options));

  // Recursive processing
  transformMembers(
    node.getMembers(),
    // A wrapper — the one added below, or the one the context already carries —
    // is what makes the members readonly, so an inner modifier would be
    // redundant. Without one, each member has to say so itself.
    skipWrapping ? 'add' : 'remove',
    nextReadonlyContext({
      currentReadonlyContext: readonlyContext,
      nextReadonlyContextType: 'none',
      indexedAccessDepthChange: 'decr',
    }),
    options,
  );

  if (wrappingApplies && !skipWrapping) {
    // `{ readonly x: X, readonly y: Y } |-> Readonly<{ x: X, y: Y }>`
    options.replaceNode(node, `Readonly<${node.getText()}>`);
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
  readonlyContext: StrictExclude<
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
    pipe(node.getQuestionToken()?.getText()).mapNullable((t) =>
      t === '?' ? '?' : t === '-' ? '-?' : t === '+' ? '+?' : undefined,
    ).value ?? '';

  // Key remapping (`as` clause). It is part of the key set the mapped type
  // produces, so dropping it would silently change the type.
  const nameTypeText = pipe(node.getNameTypeNode()?.getFullText()).mapNullable(
    (t) => ` as ${t.trim()}`,
  ).value;

  const result: string = pipe(
    // remove readonlyToken
    `{ [${node.getTypeParameter().getFullText()}${nameTypeText ?? ''}]${questionTokenText}: ${node.getTypeNode()?.getFullText()} }`,
  ).map((mpt) =>
    match(readonlyContext.type, {
      // Don't wrap with Readonly if already readonly or unnecessary
      DeepReadonly: mpt,
      Readonly: mpt,
      none: readonlyContext.indexedAccessDepth > 0 ? mpt : `Readonly<${mpt}>`,
    }),
  ).value;

  options.replaceNode(node, result);
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
      options.debugPrint('skipped member by disable-next-line comment');

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

    // MethodDeclaration, GetAccessorDeclaration, SetAccessorDeclaration
    // Check if method name has ignored prefix (e.g., mut_)
    if (
      (mb.isKind(tsm.SyntaxKind.MethodDeclaration) ||
        mb.isKind(tsm.SyntaxKind.GetAccessor) ||
        mb.isKind(tsm.SyntaxKind.SetAccessor)) &&
      checkIfPropertyNameShouldBeIgnored(mb.getNameNode(), options)
    ) {
      options.debugPrint('skipped method by ignored prefix');

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
      transformConstructorParameter(param, options);
    }

    const body = ctor.getBody();

    if (body !== undefined) {
      transformNode(body, initialReadonlyContext, options);
    }
  }
};

const transformConstructorParameter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  param: tsm.ParameterDeclaration,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  if (hasDisableNextLineComment(param)) {
    options.debugPrint(
      'skipped class constructor parameter by disable-next-line comment',
    );

    return;
  }

  const name = param.getName();

  if (
    mutablePrefixesOfParameter(param, options).some((p) => name.startsWith(p))
  ) {
    return;
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
};

/**
 * - `tr(A & B) -> tr(A) & tr(B)`
 * - `tr(Readonly<A> & Readonly<B>) -> Readonly<tr(A) & tr(B)>`, when `A` and `B`
 *   are type literals (see `isMergeableReadonlyTypeReferenceNode`)
 */
const transformIntersectionTypeNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.IntersectionTypeNode,
  readonlyContext: StrictExclude<
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
 * - `tr(DeepReadonly<A> | DeepReadonly<B>) |-> DeepReadonly<tr(A) | tr(B)>`
 */
const transformUnionTypeNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.UnionTypeNode,
  readonlyContext: StrictExclude<
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
  readonlyContext: StrictExclude<
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

  const withLeadingComments = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    member: tsm.TypeNode,
    memberText: string,
  ): string => `${leadingCommentsOfMember(node, member)}${memberText}` as const;

  // Whether a type literal member is wrapped at all; under `DeepReadonly` or an
  // indexed access none is.
  const wrapsTypeLiterals =
    nextReadonlyContextValue.type !== 'DeepReadonly' &&
    nextReadonlyContextValue.indexedAccessDepth === 0;

  // `Readonly<A & { b: B }>`: `A` stays under the `Readonly`, which the
  // handler of `Readonly` then takes off as redundant.
  const underReadonly =
    readonlyContext.type === 'Readonly' &&
    readonlyContext.indexedAccessDepth === 0 &&
    isTypeArgumentOfReadonly(node);

  const { primitives, arraysAndTuples, typeLiterals, others } =
    groupUnionIntersectionTypes(newTypes, {
      operator,
      underReadonly,
      deepReadonlyTypeName: options.DeepReadonly.typeName,
      keptUnwrapped: (t) => wrapsTypeLiterals && takesOffReadonly(t, options),
    });

  options.debugPrint({ primitives, arraysAndTuples, typeLiterals, others });

  // Separate empty type literals from non-empty ones when ignoreEmptyObjectTypes is true
  const isEmptyTypeLiteral = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    n: tsm.TypeNode,
  ): boolean =>
    n.isKind(tsm.SyntaxKind.TypeLiteral) && Arr.isEmpty(n.getMembers());

  const nonEmptyTypeLiterals =
    typeLiterals === undefined
      ? undefined
      : options.ignoreEmptyObjectTypes
        ? typeLiterals.nodes.filter((n) => !isEmptyTypeLiteral(n))
        : typeLiterals.nodes;

  const emptyTypeLiterals =
    typeLiterals === undefined || !options.ignoreEmptyObjectTypes
      ? undefined
      : typeLiterals.nodes.filter(isEmptyTypeLiteral);

  const typeLiteralsWrappedWithReadonly: readonly [] | readonly [string] =
    nonEmptyTypeLiterals === undefined || Arr.isEmpty(nonEmptyTypeLiterals)
      ? ([] as const)
      : ([
          unionToString({
            types: nonEmptyTypeLiterals.map((n) =>
              withLeadingComments(
                n,
                isMergeableReadonlyTypeReferenceNode(n, operator)
                  ? // NOTE: Readonly<A & B> -> (A & B) (spliced into `|`)
                    // NOTE: Readonly<A | B> -> A | B (spliced into `|`)
                    readonlyTypeArgTextSplicedInto(n, operator)
                  : n.isKind(tsm.SyntaxKind.TypeLiteral)
                    ? n.getText()
                    : // A member kept under `Readonly`; see `underReadonly`
                      wrapWithParentheses(n.getText()),
              ),
            ),
            op: operator,
            wrapWithReadonly: wrapsTypeLiterals,
          }),
        ] as const);

  // Sort by first occurrence (preserving the original union order as much as possible)
  const sorted: readonly string[] = [
    mapNullable(
      primitives,
      (a) =>
        [
          a.nodes.map((n) => withLeadingComments(n, n.getText())),
          a.firstPosition,
        ] as const,
    ),
    mapNullable(
      arraysAndTuples,
      (a) =>
        [
          a.nodes.map((n) => withLeadingComments(n, n.getText())),
          a.firstPosition,
        ] as const,
    ),
    nonEmptyTypeLiterals !== undefined && Arr.isNonEmpty(nonEmptyTypeLiterals)
      ? mapNullable(
          typeLiterals,
          (a) => [typeLiteralsWrappedWithReadonly, a.firstPosition] as const,
        )
      : undefined,
    emptyTypeLiterals !== undefined && Arr.isNonEmpty(emptyTypeLiterals)
      ? mapNullable(
          typeLiterals,
          (a) =>
            [
              emptyTypeLiterals.map((n) => withLeadingComments(n, n.getText())),
              // Use a position after non-empty type literals if they exist
              a.firstPosition +
                (nonEmptyTypeLiterals !== undefined &&
                Arr.isNonEmpty(nonEmptyTypeLiterals)
                  ? 0.5
                  : 0),
            ] as const,
        )
      : undefined,
    mapNullable(
      others,
      (a) =>
        [
          // `&` is deliberately not merged, unlike `Readonly<A> & Readonly<B>`
          // above. See `mergeDeepReadonlyUnionMembers` for why.
          operator === '|'
            ? mergeDeepReadonlyUnionMembers(
                a.nodes,
                options.DeepReadonly.typeName,
                withLeadingComments,
              )
            : a.nodes.map((n) =>
                withLeadingComments(n, wrapWithParentheses(n.getText())),
              ),
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
  // Readonly<number & { x: X } & { y: Y } & readonly E[]>
  // -> number & readonly E[] & Readonly<{ x: X } & { y: Y }>

  // Readonly<number | { x: X } | { y: Y } | readonly E[]>
  // -> number | readonly E[] | Readonly<{ x: X } | { y: Y }>
  //
  // NOTE: The result is wrapped in parentheses (via `unionToString`). This is
  // intentional and required for precedence safety: without it, a member such
  // as a function type (`() => T`), or a mix of `&` and `|`, or a `readonly`
  // operator would produce invalid syntax when this node is spliced back in.
  // Idempotency is guaranteed by `transformParenthesizedTypeNode`, which
  // collapses the redundant nesting (`((X))` -> `(X)`) this wrapping can create
  // — see the note there. That prevents the parentheses from growing without
  // bound when a union/intersection sits inside a `ParenthesizedType`.
  options.replaceNode(
    node,
    unionToString({ types: sorted, op: operator, wrapWithReadonly: false }),
  );
};

/**
 * - `tr(DeepReadonly<A> | B | DeepReadonly<C>) |-> DeepReadonly<A | C> | B`
 *
 * The merged member takes the place of the first `DeepReadonly` member.
 *
 * Only a union is merged, although `Readonly<A> & Readonly<B>` is merged into
 * `Readonly<A & B>`. The two differ in kind:
 *
 * - `Readonly` is a homomorphic mapped type, and over type literals
 *   `Readonly<A & B>` and `Readonly<A> & Readonly<B>` have the same properties
 *   with the same modifiers. That does not hold for an array `A`, so an
 *   intersection merges only `Readonly<T>` whose `T` is known to be a type
 *   literal; see `isMergeableReadonlyTypeReferenceNode`.
 * - `DeepReadonly` is a conditional type that picks a branch by what `T` is
 *   (primitive, function, Map, Set, array, object). It distributes over a union
 *   because each member is tested on its own, but an intersection is tested as
 *   a whole and matches every branch any one member matches: with
 *   `F = () => void`, `F & { x: number[] }` extends a function type because `F`
 *   does, so `DeepReadonly<F & { x: number[] }>` hits that branch and returns
 *   the intersection unchanged, leaving `x` mutable, while `DeepReadonly<F> &
 *   DeepReadonly<{ x: number[] }>` is `F & { readonly x: readonly number[] }`.
 *   The codemod cannot tell whether a type argument is such a member, so it
 *   merges no intersection.
 *
 * The test "premises of merging DeepReadonly members" pins both facts against
 * ts-type-forge's `DeepReadonly`.
 */
const mergeDeepReadonlyUnionMembers = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  nodes: readonly tsm.TypeNode[],
  deepReadonlyTypeName: string,
  withLeadingComments: (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    member: tsm.TypeNode,
    memberText: string,
  ) => string,
): readonly string[] => {
  const typeArgsOfDeepReadonly = nodes.map((n) =>
    getDeepReadonlyTypeArg(n, deepReadonlyTypeName),
  );

  const asIs = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    n: tsm.TypeNode,
  ): string => withLeadingComments(n, wrapWithParentheses(n.getText()));

  if (typeArgsOfDeepReadonly.filter((t) => t !== undefined).length < 2) {
    return nodes.map(asIs);
  }

  const firstIndex = typeArgsOfDeepReadonly.findIndex((t) => t !== undefined);

  const merged = unionToString({
    // A member's comments move inside, onto its type argument:
    // `/** a */ DeepReadonly<A> | /** b */ DeepReadonly<B>`
    // -> `DeepReadonly</** a */ A | /** b */ B>`
    types: nodes.flatMap((n, i) => {
      const t_ = typeArgsOfDeepReadonly[i];

      if (t_ === undefined) {
        return [];
      }

      const t = removeParentheses(t_);

      // NOTE: DeepReadonly<A | B> | DeepReadonly<C> -> DeepReadonly<A | B | C>
      // NOTE: DeepReadonly<() => void> | DeepReadonly<B> -> DeepReadonly<(() => void) | B>
      const tText = textWithoutParentheses(t_, t);

      return [
        withLeadingComments(
          n,
          t.isKind(tsm.SyntaxKind.UnionType)
            ? tText
            : wrapWithParentheses(tText),
        ),
      ];
    }),
    op: '|',
    wrapWithReadonly: deepReadonlyTypeName,
  });

  return nodes.flatMap((n, i) =>
    typeArgsOfDeepReadonly[i] === undefined
      ? [asIs(n)]
      : i === firstIndex
        ? [merged]
        : [],
  );
};

/** Whether `node` is the type argument of `Readonly<...>`, parentheses aside. */
const isTypeArgumentOfReadonly = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeNode,
): boolean => {
  const parent = node.getParent();

  return (
    parent !== undefined &&
    (parent.isKind(tsm.SyntaxKind.ParenthesizedType)
      ? isTypeArgumentOfReadonly(parent)
      : isReadonlyTypeReferenceNode(parent))
  );
};

/**
 * The comments in front of a union or intersection member, for the text that
 * replaces the whole type.
 *
 * `replaceWithText` overwrites a node from its `getStart()`, so whatever lies
 * in front of that stays in the file by itself. With no leading `|` / `&`, the
 * first member starts there too, and its comments are the type's: repeating
 * them in the replacement would copy them once per run. Every other member
 * has a separator in front of it, and a comment before the separator belongs
 * to no member's full text, so it is gone once the separator is rewritten. It
 * goes with the member after it, like the comments after the separator.
 *
 * `member` may be the type inside a member's parentheses; the comments inside
 * them are collected too, and the parentheses are not.
 */
const leadingCommentsOfMember = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.IntersectionTypeNode | tsm.UnionTypeNode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  member: tsm.TypeNode,
): string =>
  commentsBetween(
    node.getSourceFile(),
    node
      .getTypeNodes()
      .findLast((m) => m.getEnd() <= member.getStart())
      ?.getEnd() ?? node.getStart(),
    member.getStart(),
  );

/**
 * `Readonly<T>` |-> the text of `T`, to be spliced into a union (`|`) or an
 * intersection (`&`) of the members it is merged with.
 *
 * `T` is wrapped in parentheses for precedence safety (a function type
 * argument needs them), unless it is a union spliced into a union or an
 * intersection spliced into an intersection, which needs none.
 */
const readonlyTypeArgTextSplicedInto = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: ReadonlyTypeReferenceNode,
  operator: '&' | '|',
): string => {
  const typeArgument = node.getTypeArguments()[0];

  const T = removeParentheses(typeArgument);

  return T.isKind(
    operator === '|'
      ? tsm.SyntaxKind.UnionType
      : tsm.SyntaxKind.IntersectionType,
  )
    ? textWithoutParentheses(typeArgument, T)
    : unwrapReadonlyTypeArgText(node);
};

/**
 * The text of `inner`, a type `removeParentheses` took out of `outer`, with
 * the comments in `outer`'s full text in front of it — before the parentheses
 * and inside them — and without the parentheses.
 *
 * `inner.getFullText()` would drop those before the parentheses, which are
 * as much a part of `outer` as the rest of it.
 */
const textWithoutParentheses = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  outer: tsm.TypeNode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  inner: tsm.TypeNode,
): string =>
  `${commentsBetween(outer.getSourceFile(), outer.getPos(), inner.getStart())}${inner.getText()}` as const;

/**
 * The comments in `[from, to)` of a source file, each followed by what keeps
 * the next token off it, and nothing else in that range — no whitespace, and
 * no token such as a separator or a parenthesis.
 */
const commentsBetween = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.SourceFile,
  from: number,
  to: number,
): string => {
  if (to <= from) {
    return '';
  }

  const scanner = tsm.ts.createScanner(
    tsm.ts.ScriptTarget.Latest,
    false,
    tsm.ts.LanguageVariant.Standard,
    sourceFile.getFullText(),
    undefined,
    from,
    to - from,
  );

  const mut_comments: string[] = [];

  while (scanner.scan() !== tsm.ts.SyntaxKind.EndOfFileToken) {
    const token = scanner.getToken();

    // A line comment runs to the end of the line, so it takes one along.
    const separator =
      token === tsm.ts.SyntaxKind.SingleLineCommentTrivia
        ? '\n'
        : token === tsm.ts.SyntaxKind.MultiLineCommentTrivia
          ? ' '
          : undefined;

    if (separator !== undefined) {
      mut_comments.push(`${scanner.getTokenText()}${separator}`);
    }
  }

  return mut_comments.join('');
};

/** `DeepReadonly<T>` |-> `T`, anything else |-> `undefined` */
const getDeepReadonlyTypeArg = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeNode,
  deepReadonlyTypeName: string,
): tsm.TypeNode | undefined => {
  if (!node.isKind(tsm.SyntaxKind.TypeReference)) {
    return undefined;
  }

  const typeName = node.getTypeName();

  const typeArguments = node.getTypeArguments();

  return typeName.isKind(tsm.SyntaxKind.Identifier) &&
    typeName.getText() === deepReadonlyTypeName &&
    Arr.isFixedLengthArray(1, typeArguments)
    ? typeArguments[0]
    : undefined;
};

const unionToString = ({
  types: typesRaw,
  op,
  wrapWithReadonly,
}: Readonly<{
  types: readonly string[];
  op: '&' | '|';
  wrapWithReadonly: boolean | string;
}>): string => {
  // The members are joined with a separator that supplies its own space, so
  // whitespace left at a member's edge would accumulate: every run of the
  // transformer would add one more space before every member but the first,
  // and a file would never reach a fixed point. Trimming keeps the comments in
  // front of a member, which are not whitespace.
  const types = typesRaw.map((s) => s.trim());

  return unionToStringImpl({ types, op, wrapWithReadonly });
};

const unionToStringImpl = ({
  types,
  op,
  wrapWithReadonly,
}: Readonly<{
  types: readonly string[];
  op: '&' | '|';
  wrapWithReadonly: boolean | string;
}>): string =>
  Arr.isEmpty(types)
    ? 'never'
    : Arr.isFixedLengthArray(1, types)
      ? wrapWithReadonly === false
        ? wrapWithParentheses(types[0])
        : (`${isString(wrapWithReadonly) ? wrapWithReadonly : 'Readonly'}<${types[0]}>` as const)
      : wrapWithReadonly === false
        ? wrapWithParentheses(types.join(` ${op} `))
        : (`${isString(wrapWithReadonly) ? wrapWithReadonly : 'Readonly'}<${types.join(` ${op} `)}>` as const);

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
    isAtomicTypeNode(T) ||
    // remove () if T is TypeLiteralNode
    // e.g. `({ member: V }) |-> { member: V }`
    T.isKind(tsm.SyntaxKind.TypeLiteral) ||
    // collapse redundant nested parentheses if T is itself a ParenthesizedType
    // e.g. `((X)) |-> (X)`
    //
    // This is what makes the transform terminate on nested parentheses. The
    // union/intersection handler defensively wraps its result in parentheses
    // for precedence safety, which turns `(A | B)` into `((A | B))` when the
    // union already sits inside a `ParenthesizedType`. Collapsing the redundant
    // outer layer here means each pass removes exactly the layer the wrapping
    // added, so the parentheses no longer grow without bound (which previously
    // overflowed the parser stack on inputs like `type T = (('a' | 'b'))`).
    T.isKind(tsm.SyntaxKind.ParenthesizedType)
  ) {
    options.replaceNode(node, T.getFullText());
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
  readonlyContext: StrictExtract<
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
      options.debugPrint('skipped by member disable-next-line comment');

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

    // A method or an accessor of an ignored prefix is left as written, as in a
    // class.
    if (
      (mb.isKind(tsm.SyntaxKind.MethodSignature) ||
        mb.isKind(tsm.SyntaxKind.GetAccessor) ||
        mb.isKind(tsm.SyntaxKind.SetAccessor)) &&
      checkIfPropertyNameShouldBeIgnored(mb.getNameNode(), options)
    ) {
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
  }
};

const transformPropertySignature = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.PropertySignature,
  readonlyModifier: 'add' | 'remove',
  readonlyContext: StrictExtract<
    ReadonlyContext,
    Readonly<{
      type: 'DeepReadonly' | 'none';
      indexedAccessDepth: SafeUintWithSmallInt;
    }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  if (
    readonlyModifier === 'remove' ||
    readonlyContext.type === 'DeepReadonly'
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
  readonlyContext: StrictExtract<
    ReadonlyContext,
    Readonly<{
      type: 'DeepReadonly' | 'none';
      indexedAccessDepth: SafeUintWithSmallInt;
    }>
  >,
  options: ReadonlyTransformerOptionsInternal,
): void => {
  if (hasDisableNextLineComment(node, TRANSFORMER_NAME)) {
    options.debugPrint('skipped index signature by disable-next-line comment');

    return;
  }

  if (
    readonlyModifier === 'remove' ||
    readonlyContext.type === 'DeepReadonly'
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
    | tsm.NumericLiteral
    | tsm.BigIntLiteral
    | tsm.NoSubstitutionTemplateLiteral
    | tsm.Identifier
    | tsm.StringLiteral
    | tsm.PrivateIdentifier
    | tsm.ComputedPropertyName // [`mut_x`]: number[]
  >('=');

  return (
    // mut_x: number[]
    (nameNode.isKind(tsm.SyntaxKind.Identifier) &&
      pipe(nameNode.getText()).map((nm) =>
        options.mutablePropertyPrefixes.some((p) => nm.startsWith(p)),
      ).value) ||
    // "mut_x": number[]
    (nameNode.isKind(tsm.SyntaxKind.StringLiteral) &&
      pipe(nameNode.getLiteralValue()).map((nm) =>
        options.mutablePropertyPrefixes.some((p) => nm.startsWith(p)),
      ).value) ||
    //  #memberName: number[] (class only), matched with or after its `#`
    (nameNode.isKind(tsm.SyntaxKind.PrivateIdentifier) &&
      pipe(nameNode.getText()).map((nm) =>
        options.mutablePropertyPrefixes.some(
          (p) => nm.startsWith(p) || nm.startsWith(`#${p}`),
        ),
      ).value) ||
    // ['mut_x']: number[], [`mut_x`]: number[]
    (nameNode.isKind(tsm.SyntaxKind.ComputedPropertyName) &&
      pipe(nameNode.getExpression()).map((exp) => {
        if (
          exp.isKind(tsm.SyntaxKind.StringLiteral) ||
          exp.isKind(tsm.SyntaxKind.NoSubstitutionTemplateLiteral)
        ) {
          const nm = exp.getLiteralValue();

          return options.mutablePropertyPrefixes.some((p) => nm.startsWith(p));
        }

        return false;
      }).value)
  );
};

/**
 * Whether a type literal is left without `Readonly<...>` and marked readonly
 * member by member, because it has a property, a method or an accessor of an
 * ignored prefix (`{ mut_x: X[] }`), which `transformMembers` leaves mutable
 * and `Readonly<T>` would not.
 *
 * It keeps its `Readonly<...>` when that would leave another member mutable,
 * since only a property or index signature can be marked `readonly` itself:
 *
 * - a method signature or an accessor, which `Readonly<T>` makes readonly too,
 *   unless its name has an ignored prefix as well;
 * - a property or index signature the ignore comment skips (as
 *   `transformMembers` does), which gets no `readonly` of its own, unless it
 *   is `readonly` already.
 */
const isLeftUnwrapped = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeLiteralNode,
  options: ReadonlyTransformerOptionsInternal,
): boolean => {
  const members = node.getMembers();

  const isMethodOrAccessor = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    mb: tsm.TypeElementTypes,
  ): mb is
    | tsm.MethodSignature
    | tsm.GetAccessorDeclaration
    | tsm.SetAccessorDeclaration =>
    mb.isKind(tsm.SyntaxKind.MethodSignature) ||
    mb.isKind(tsm.SyntaxKind.GetAccessor) ||
    mb.isKind(tsm.SyntaxKind.SetAccessor);

  const isIgnoredMember = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    mb: tsm.TypeElementTypes,
  ): boolean =>
    (mb.isKind(tsm.SyntaxKind.PropertySignature) || isMethodOrAccessor(mb)) &&
    checkIfPropertyNameShouldBeIgnored(mb.getNameNode(), options);

  const needsReadonlyWrapper = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    mb: tsm.TypeElementTypes,
  ): boolean =>
    !isIgnoredMember(mb) &&
    (isMethodOrAccessor(mb) ||
      ((mb.isKind(tsm.SyntaxKind.PropertySignature) ||
        mb.isKind(tsm.SyntaxKind.IndexSignature)) &&
        !mb.hasModifier(tsm.SyntaxKind.ReadonlyKeyword) &&
        hasDisableNextLineComment(mb)));

  return members.some(isIgnoredMember) && !members.some(needsReadonlyWrapper);
};

/** Whether `node`, or a parenthesized type around it, carries the ignore comment. */
const hasDisableNextLineCommentAround = (node: tsm.Node): boolean => {
  if (hasDisableNextLineComment(node, TRANSFORMER_NAME)) {
    return true;
  }

  const parent = node.getParent();

  return (
    parent?.isKind(tsm.SyntaxKind.ParenthesizedType) === true &&
    hasDisableNextLineCommentAround(parent)
  );
};

/**
 * Whether a type literal that is already wrapped, or would be merged into the
 * `Readonly<...>` of a union or intersection, is taken out of it. See
 * `isLeftUnwrapped`; in addition, the ignore comment leaves the literal where
 * it is, and taking `Readonly` off one with a call or construct signature
 * would bring back the signature it dropped.
 */
const takesOffReadonly = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeLiteralNode,
  options: ReadonlyTransformerOptionsInternal,
): boolean =>
  isLeftUnwrapped(node, options) &&
  !hasCallOrConstructSignature(node) &&
  !hasDisableNextLineCommentAround(node);

/**
 * A parameter property is a property of the class, as a `PropertyDeclaration`
 * is; any other parameter is a variable.
 */
const mutablePrefixesOfParameter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  param: tsm.ParameterDeclaration,
  options: ReadonlyTransformerOptionsInternal,
): ISet<string> =>
  param.isParameterProperty()
    ? options.mutablePropertyPrefixes
    : options.mutableVariablePrefixes;
