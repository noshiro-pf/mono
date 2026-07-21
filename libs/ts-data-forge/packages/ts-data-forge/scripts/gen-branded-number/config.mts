/**
 * Declarative configuration for the branded-number modules under
 * `src/number/branded-types`. The generator (`generate.mts` via `render.mts`)
 * turns each entry into a complete module: structural scaffolding (imports,
 * factory call, `is`/`as`, namespace object, `expectType` assertions) plus
 * flag-driven JSDoc prose. Worked `@example` blocks are left as placeholders and
 * filled by `embed-examples-in-jsdoc`.
 *
 * Covers every branded-number module: the `operatorsForInteger` and
 * `operatorsForFloat` families under `branded-types/`, plus the hand-wrapped
 * `enum` modules (`Int8`/`Uint8`) via `enumSpec`.
 */
export type BrandedNumberConfig = Readonly<{
  // --- identity ---
  pascalName: string;
  kebabName: string;
  dir: 'branded-types' | 'enum';

  // --- underlying type ---
  /** The ts-type-forge type re-exported as `<pascalName>` (imported aliased). */
  ttfType: string;
  /** RHS of `type ElementType = ...` (usually the type itself). */
  elementTypeRhs: string;
  /** Extra ts-type-forge type names to import (merged/sorted by organize-imports). */
  extraTtfTypes?: readonly string[];
  /** Extra verbatim import statements (e.g. sibling value imports). */
  extraImports?: readonly string[];

  // --- factory call ---
  factory: 'operatorsForInteger' | 'operatorsForFloat';
  /** Type generics passed to the factory, e.g. `['ElementType', 'number', 'number']`. */
  generics: readonly string[];
  integerOrSafeInteger?: 'Integer' | 'SafeInteger';
  nonZero: boolean;
  /**
   * Whether the module surfaces the factory's `randomNonZero` operator under the
   * namespace `random` key (the `NonZero*` families). Distinct from `nonZero`:
   * the negative families set `nonZero` but still use the plain `random`.
   */
  randomNonZero?: boolean;
  /** Verbatim `MIN_VALUE` value expression. */
  minValueExpr: string;
  /** Verbatim `MAX_VALUE` value expression. */
  maxValueExpr: string;
  /** Optional `// eslint-disable...` comment emitted directly above `MIN_VALUE`. */
  minValueComment?: string;
  /** Optional `// eslint-disable...` comment emitted directly above `MAX_VALUE`. */
  maxValueComment?: string;
  /**
   * Optional clarifying sentence appended to the `MIN_VALUE` const JSDoc — used
   * by open-domain types whose exposed `MIN_VALUE` is the nearest representable
   * value rather than the mathematical bound (e.g. `PositiveFiniteNumber`).
   */
  minValueNote?: string;
  /**
   * Optional clarifying sentence appended to the `MAX_VALUE` const JSDoc — used
   * by open-domain types whose exposed `MAX_VALUE` is the nearest representable
   * value rather than the mathematical bound (e.g. `NegativeFiniteNumber`).
   */
  maxValueNote?: string;
  typeNameInMessage: string;

  // --- locally-defined members (not from the factory) ---
  /** Verbatim const declarations emitted between the factory call and `is<T>`. */
  customConsts?: string;
  /** Namespace keys provided by `customConsts` (excluded from the destructure). */
  customKeys?: readonly string[];

  // --- namespace shape ---
  /** Ordered namespace object keys (methods and `MIN_VALUE`/`MAX_VALUE` constants). */
  namespaceKeys: readonly string[];

  // --- expectType assertion ---
  /**
   * `NumberClass` type params after `ElementType`, e.g. `"'int'"` or
   * `"'int' | 'range', 'mul'"`. `undefined` means emit no `expectType` (the
   * negative / non-positive families).
   */
  numberClassParams?: string;
  /**
   * Verbatim `expectType<...>(...)` assertion(s) emitted right after the custom
   * consts and before `is<T>` (the float families' `ToInt` aux assertions).
   */
  leadingExpectType?: string;
  /**
   * Verbatim `expectType<...>(...)` assertion(s) emitted after the namespace and
   * before the standard `keyof`/`typeof` assertions (float `ToNonNegative` aux).
   */
  trailingExpectTypeExtra?: string;
  /**
   * Per-member JSDoc overrides, keyed by member key (`'topGuard'`, `'topCast'`,
   * `'namespace'`, or a namespace key). Used to preserve hand-written prose that
   * carries design intent the templates cannot express (e.g. why `add`/`sub` are
   * absent from `NonZeroFiniteNumber`).
   */
  proseOverrides?: Readonly<
    Record<string, Readonly<{ description?: string; returns?: string }>>
  >;

  // --- enum modules (int8 / uint8) ---
  /**
   * When set, the module is rendered by the dedicated enum renderer: the factory
   * is parametrized by the wider `wideBase` type and every operator is
   * hand-wrapped to narrow back to the branded type.
   */
  enumSpec?: Readonly<{ wideBase: string; hasAbs: boolean }>;

  // --- prose flags ---
  /** `'floor'` for integer division, `'exact'` for float division. */
  division: 'floor' | 'exact';
  /** Precision note for non-safe integer types. */
  precision?: 'safe' | 'may-lose';
  /** Whether the module carries embedded `@example` blocks. */
  hasExamples: boolean;
}>;

const SAFE_MIN_COMMENT =
  '// eslint-disable-next-line total-functions/no-unsafe-type-assertion, math/prefer-number-min-safe-integer';

const SAFE_MAX_COMMENT =
  '// eslint-disable-next-line total-functions/no-unsafe-type-assertion, math/prefer-number-max-safe-integer';

// Namespace key orderings shared across families (see structural spec).
const KEYS_BOUNDED = [
  'is',
  'MIN_VALUE',
  'MAX_VALUE',
  'min',
  'max',
  'fromNumber',
  'random',
  'pow',
  'add',
  'sub',
  'mul',
  'div',
] as const;

const KEYS_BOUNDED_ABS = [
  'is',
  'MIN_VALUE',
  'MAX_VALUE',
  'abs',
  'min',
  'max',
  'fromNumber',
  'random',
  'pow',
  'add',
  'sub',
  'mul',
  'div',
] as const;

const KEYS_NONZERO_BOUNDED_ABS = [
  'is',
  'MIN_VALUE',
  'MAX_VALUE',
  'abs',
  'min',
  'max',
  'fromNumber',
  'random',
  'pow',
  'mul',
] as const;

const KEYS_NONZERO_UINT = [
  'is',
  'MIN_VALUE',
  'MAX_VALUE',
  'min',
  'max',
  'fromNumber',
  'random',
  'pow',
  'add',
  'mul',
] as const;

// Return types of the locally-defined float rounding operators.
const TO_INT_RET = 'TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>';

const REMOVE_NZ_RET =
  `TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<${TO_INT_RET}>` as const;

/** A locally-defined `floor`/`ceil`/`round` const for a float module. */
const roundingConst = (name: string, ret: string): string =>
  [
    `const ${name} = (x: ElementType): ${ret} =>`,
    '  // eslint-disable-next-line total-functions/no-unsafe-type-assertion',
    `  Math.${name}(x) as ${ret};`,
  ].join('\n');

/** The `floor`/`ceil`/`round` block for a float module (per-method return type). */
const floatRounding = (
  floorRet: string,
  ceilRet: string,
  roundRet: string,
): string =>
  [
    roundingConst('floor', floorRet),
    roundingConst('ceil', ceilRet),
    roundingConst('round', roundRet),
  ].join('\n\n');

const FLOAT_KEYS_UNBOUNDED_ABS = [
  'is',
  'abs',
  'min',
  'max',
  'floor',
  'ceil',
  'round',
  'random',
  'pow',
  'add',
  'sub',
  'mul',
  'div',
] as const;

const FLOAT_KEYS_LOWER_BOUNDED = [
  'is',
  'MIN_VALUE',
  'min',
  'max',
  'fromNumber',
  'floor',
  'ceil',
  'round',
  'random',
  'pow',
  'add',
  'sub',
  'mul',
  'div',
] as const;

export const brandedNumberConfigs: readonly BrandedNumberConfig[] = [
  {
    pascalName: 'Int',
    kebabName: 'int',
    dir: 'branded-types',
    ttfType: 'Int',
    elementTypeRhs: 'Int',
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'number', 'number'],
    integerOrSafeInteger: 'Integer',
    nonZero: false,
    minValueExpr: '-Number.MAX_VALUE',
    maxValueExpr: 'Number.MAX_VALUE',
    typeNameInMessage: 'an integer',
    namespaceKeys: [
      'is',
      'abs',
      'min',
      'max',
      'random',
      'pow',
      'add',
      'sub',
      'mul',
      'div',
    ],
    numberClassParams: "'int'",
    division: 'floor',
    precision: 'may-lose',
    hasExamples: true,
  },
  {
    pascalName: 'Int16',
    kebabName: 'int16',
    dir: 'branded-types',
    ttfType: 'Int16',
    elementTypeRhs: 'Int16',
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'number', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '-(2 ** 15)',
    maxValueExpr: '2 ** 15 - 1',
    typeNameInMessage: 'an integer in [-2^15, 2^15)',
    namespaceKeys: KEYS_BOUNDED_ABS,
    numberClassParams: "'int' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'Int32',
    kebabName: 'int32',
    dir: 'branded-types',
    ttfType: 'Int32',
    elementTypeRhs: 'Int32',
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'number', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '-(2 ** 31)',
    maxValueExpr: '2 ** 31 - 1',
    typeNameInMessage: 'an integer in [-2^31, 2^31)',
    namespaceKeys: KEYS_BOUNDED_ABS,
    numberClassParams: "'int' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'SafeInt',
    kebabName: 'safe-int',
    dir: 'branded-types',
    ttfType: 'SafeInt',
    elementTypeRhs: 'SafeInt',
    extraTtfTypes: ['SafeUint'],
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'SafeInt', 'SafeUint'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: 'Number.MIN_SAFE_INTEGER as SafeInt',
    minValueComment: SAFE_MIN_COMMENT,
    maxValueExpr: 'Number.MAX_SAFE_INTEGER as SafeUint',
    maxValueComment: SAFE_MAX_COMMENT,
    typeNameInMessage: 'a safe integer',
    namespaceKeys: KEYS_BOUNDED_ABS,
    numberClassParams: "'int' | 'range'",
    division: 'floor',
    hasExamples: true,
  },
  {
    pascalName: 'Uint',
    kebabName: 'uint',
    dir: 'branded-types',
    ttfType: 'Uint',
    elementTypeRhs: 'Uint',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '0', 'number'],
    integerOrSafeInteger: 'Integer',
    nonZero: false,
    minValueExpr: '0',
    maxValueExpr: 'Number.MAX_VALUE',
    typeNameInMessage: 'a non-negative integer',
    namespaceKeys: [
      'is',
      'MIN_VALUE',
      'min',
      'max',
      'fromNumber',
      'random',
      'pow',
      'add',
      'sub',
      'mul',
      'div',
    ],
    numberClassParams: "'int' | 'non-negative'",
    division: 'floor',
    precision: 'may-lose',
    hasExamples: true,
  },
  {
    pascalName: 'Uint16',
    kebabName: 'uint16',
    dir: 'branded-types',
    ttfType: 'Uint16',
    elementTypeRhs: 'Uint16',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '0', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '0',
    maxValueExpr: '2 ** 16 - 1',
    typeNameInMessage: 'a non-negative integer less than 2^16',
    namespaceKeys: KEYS_BOUNDED,
    numberClassParams: "'int' | 'non-negative' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'Uint32',
    kebabName: 'uint32',
    dir: 'branded-types',
    ttfType: 'Uint32',
    elementTypeRhs: 'Uint32',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '0', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '0',
    maxValueExpr: '2 ** 32 - 1',
    typeNameInMessage: 'a non-negative integer less than 2^32',
    namespaceKeys: KEYS_BOUNDED,
    numberClassParams: "'int' | 'non-negative' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'SafeUint',
    kebabName: 'safe-uint',
    dir: 'branded-types',
    ttfType: 'SafeUint',
    elementTypeRhs: 'SafeUint',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '0', 'SafeUint'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '0',
    maxValueExpr: 'Number.MAX_SAFE_INTEGER as SafeUint',
    maxValueComment: SAFE_MAX_COMMENT,
    typeNameInMessage: 'a non-negative safe integer',
    namespaceKeys: KEYS_BOUNDED,
    numberClassParams: "'int' | 'non-negative' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'NonNegativeInt16',
    kebabName: 'non-negative-int16',
    dir: 'branded-types',
    ttfType: 'NonNegativeInt16',
    elementTypeRhs: 'NonNegativeInt16',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '0', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '0',
    maxValueExpr: '2 ** 15 - 1',
    typeNameInMessage: 'a non-negative integer in [0, 2^15)',
    namespaceKeys: KEYS_BOUNDED,
    numberClassParams: "'int' | 'non-negative' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'NonNegativeInt32',
    kebabName: 'non-negative-int32',
    dir: 'branded-types',
    ttfType: 'NonNegativeInt32',
    elementTypeRhs: 'NonNegativeInt32',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '0', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '0',
    maxValueExpr: '2 ** 31 - 1',
    typeNameInMessage: 'a non-negative integer in [0, 2^31)',
    namespaceKeys: KEYS_BOUNDED,
    numberClassParams: "'int' | 'non-negative' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'PositiveInt',
    kebabName: 'positive-int',
    dir: 'branded-types',
    ttfType: 'PositiveInt',
    elementTypeRhs: 'PositiveInt',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '1', 'number'],
    integerOrSafeInteger: 'Integer',
    nonZero: false,
    minValueExpr: '1',
    maxValueExpr: 'Number.MAX_VALUE',
    typeNameInMessage: 'a positive integer',
    namespaceKeys: [
      'is',
      'MIN_VALUE',
      'min',
      'max',
      'fromNumber',
      'random',
      'pow',
      'add',
      'sub',
      'mul',
      'div',
    ],
    numberClassParams: "'int' | 'positive'",
    division: 'floor',
    precision: 'may-lose',
    hasExamples: true,
  },
  {
    pascalName: 'PositiveInt16',
    kebabName: 'positive-int16',
    dir: 'branded-types',
    ttfType: 'PositiveInt16',
    elementTypeRhs: 'PositiveInt16',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '1', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '1',
    maxValueExpr: '2 ** 15 - 1',
    typeNameInMessage: 'a positive integer in [1, 2^15)',
    namespaceKeys: KEYS_BOUNDED,
    numberClassParams: "'int' | 'positive' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'PositiveInt32',
    kebabName: 'positive-int32',
    dir: 'branded-types',
    ttfType: 'PositiveInt32',
    elementTypeRhs: 'PositiveInt32',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '1', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '1',
    maxValueExpr: '2 ** 31 - 1',
    typeNameInMessage: 'a positive integer in [1, 2^31)',
    namespaceKeys: KEYS_BOUNDED,
    numberClassParams: "'int' | 'positive' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'PositiveSafeInt',
    kebabName: 'positive-safe-int',
    dir: 'branded-types',
    ttfType: 'PositiveSafeInt',
    elementTypeRhs: 'PositiveSafeInt',
    extraTtfTypes: ['SafeUint'],
    factory: 'operatorsForInteger',
    generics: ['ElementType', '1', 'SafeUint'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '1',
    maxValueExpr: 'Number.MAX_SAFE_INTEGER as SafeUint',
    maxValueComment: SAFE_MAX_COMMENT,
    typeNameInMessage: 'a positive safe integer',
    namespaceKeys: KEYS_BOUNDED,
    numberClassParams: "'int' | 'positive' | 'range'",
    division: 'floor',
    hasExamples: true,
  },
  {
    pascalName: 'PositiveUint16',
    kebabName: 'positive-uint16',
    dir: 'branded-types',
    ttfType: 'PositiveUint16',
    elementTypeRhs: 'PositiveUint16',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '1', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '1',
    maxValueExpr: '2 ** 16 - 1',
    typeNameInMessage: 'a positive integer in [1, 2^16)',
    namespaceKeys: KEYS_BOUNDED,
    numberClassParams: "'int' | 'positive' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'PositiveUint32',
    kebabName: 'positive-uint32',
    dir: 'branded-types',
    ttfType: 'PositiveUint32',
    elementTypeRhs: 'PositiveUint32',
    factory: 'operatorsForInteger',
    generics: ['ElementType', '1', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '1',
    maxValueExpr: '2 ** 32 - 1',
    typeNameInMessage: 'a positive integer in [1, 2^32)',
    namespaceKeys: KEYS_BOUNDED,
    numberClassParams: "'int' | 'positive' | 'range'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'NonZeroInt',
    kebabName: 'non-zero-int',
    dir: 'branded-types',
    ttfType: 'NonZeroInt',
    elementTypeRhs: 'NonZeroInt',
    randomNonZero: true,
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'number', 'number'],
    integerOrSafeInteger: 'Integer',
    nonZero: true,
    minValueExpr: '-Number.MAX_VALUE',
    maxValueExpr: 'Number.MAX_VALUE',
    typeNameInMessage: 'a non-zero integer',
    namespaceKeys: ['is', 'abs', 'min', 'max', 'random', 'pow', 'mul'],
    numberClassParams: "'int', 'mul'",
    division: 'floor',
    precision: 'may-lose',
    hasExamples: false,
  },
  {
    pascalName: 'NonZeroInt16',
    kebabName: 'non-zero-int16',
    dir: 'branded-types',
    ttfType: 'NonZeroInt16',
    elementTypeRhs: 'NonZeroInt16',
    randomNonZero: true,
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'number', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: true,
    minValueExpr: '-(2 ** 15)',
    maxValueExpr: '2 ** 15 - 1',
    typeNameInMessage: 'a non-zero integer in [-2^15, 2^15)',
    namespaceKeys: KEYS_NONZERO_BOUNDED_ABS,
    numberClassParams: "'int' | 'range', 'mul'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'NonZeroInt32',
    kebabName: 'non-zero-int32',
    dir: 'branded-types',
    ttfType: 'NonZeroInt32',
    elementTypeRhs: 'NonZeroInt32',
    randomNonZero: true,
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'number', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: true,
    minValueExpr: '-(2 ** 31)',
    maxValueExpr: '2 ** 31 - 1',
    typeNameInMessage: 'a non-zero integer in [-2^31, 2^31)',
    namespaceKeys: KEYS_NONZERO_BOUNDED_ABS,
    numberClassParams: "'int' | 'range', 'mul'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'NonZeroSafeInt',
    kebabName: 'non-zero-safe-int',
    dir: 'branded-types',
    ttfType: 'NonZeroSafeInt',
    elementTypeRhs: 'NonZeroSafeInt',
    randomNonZero: true,
    extraTtfTypes: ['SafeInt', 'SafeUint'],
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'SafeInt', 'SafeUint'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: true,
    minValueExpr: 'Number.MIN_SAFE_INTEGER as SafeInt',
    minValueComment: SAFE_MIN_COMMENT,
    maxValueExpr: 'Number.MAX_SAFE_INTEGER as SafeUint',
    maxValueComment: SAFE_MAX_COMMENT,
    typeNameInMessage: 'a non-zero safe integer',
    namespaceKeys: KEYS_NONZERO_BOUNDED_ABS,
    numberClassParams: "'int' | 'range', 'mul'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'NonZeroUint16',
    kebabName: 'non-zero-uint16',
    dir: 'branded-types',
    ttfType: 'NonZeroUint16',
    elementTypeRhs: 'NonZeroUint16',
    randomNonZero: true,
    factory: 'operatorsForInteger',
    generics: ['ElementType', '1', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: true,
    minValueExpr: '1',
    maxValueExpr: '2 ** 16 - 1',
    typeNameInMessage: 'a non-zero integer in [1, 2^16)',
    namespaceKeys: KEYS_NONZERO_UINT,
    numberClassParams: "'int' | 'positive' | 'range', 'add' | 'mul'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'NonZeroUint32',
    kebabName: 'non-zero-uint32',
    dir: 'branded-types',
    ttfType: 'NonZeroUint32',
    elementTypeRhs: 'NonZeroUint32',
    randomNonZero: true,
    factory: 'operatorsForInteger',
    generics: ['ElementType', '1', 'number'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: true,
    minValueExpr: '1',
    maxValueExpr: '2 ** 32 - 1',
    typeNameInMessage: 'a non-zero integer in [1, 2^32)',
    namespaceKeys: KEYS_NONZERO_UINT,
    numberClassParams: "'int' | 'positive' | 'range', 'add' | 'mul'",
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'NonPositiveInt',
    kebabName: 'non-positive-int',
    dir: 'branded-types',
    ttfType: 'NonPositiveInt',
    elementTypeRhs: 'NonPositiveInt',
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'number', '0'],
    integerOrSafeInteger: 'Integer',
    nonZero: false,
    minValueExpr: '-Number.MAX_VALUE',
    maxValueExpr: '0',
    typeNameInMessage: 'a non-positive integer',
    namespaceKeys: [
      'is',
      'MAX_VALUE',
      'min',
      'max',
      'fromNumber',
      'random',
      'pow',
      'add',
      'sub',
    ],
    division: 'floor',
    precision: 'may-lose',
    hasExamples: false,
  },
  {
    pascalName: 'NonPositiveSafeInt',
    kebabName: 'non-positive-safe-int',
    dir: 'branded-types',
    ttfType: 'NonPositiveSafeInt',
    elementTypeRhs: 'NonPositiveSafeInt',
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'number', '0'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: 'Number.MIN_SAFE_INTEGER',
    maxValueExpr: '0',
    typeNameInMessage: 'a non-positive safe integer',
    namespaceKeys: [
      'is',
      'MIN_VALUE',
      'MAX_VALUE',
      'min',
      'max',
      'fromNumber',
      'random',
      'pow',
      'add',
      'sub',
    ],
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'NegativeInt',
    kebabName: 'negative-int',
    dir: 'branded-types',
    ttfType: 'NegativeInt',
    elementTypeRhs: 'NegativeInt',
    extraTtfTypes: ['WithSmallInt'],
    extraImports: ["import { PositiveInt } from './positive-int.mjs';"],
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'number', '-1'],
    integerOrSafeInteger: 'Integer',
    nonZero: true,
    minValueExpr: '-Number.MAX_VALUE',
    maxValueExpr: '-1',
    typeNameInMessage: 'a negative integer',
    customConsts:
      'const abs = (x: WithSmallInt<ElementType>): PositiveInt =>\n  PositiveInt.fromNumber(Math.abs(x));',
    customKeys: ['abs'],
    namespaceKeys: [
      'is',
      'MAX_VALUE',
      'abs',
      'min',
      'max',
      'fromNumber',
      'random',
      'pow',
      'add',
      'sub',
    ],
    division: 'floor',
    precision: 'may-lose',
    hasExamples: false,
  },
  {
    pascalName: 'NegativeSafeInt',
    kebabName: 'negative-safe-int',
    dir: 'branded-types',
    ttfType: 'NegativeSafeInt',
    elementTypeRhs: 'NegativeSafeInt',
    extraTtfTypes: ['WithSmallInt'],
    extraImports: [
      "import { PositiveSafeInt } from './positive-safe-int.mjs';",
    ],
    factory: 'operatorsForInteger',
    generics: ['ElementType', 'number', '-1'],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: true,
    minValueExpr: 'Number.MIN_SAFE_INTEGER',
    maxValueExpr: '-1',
    typeNameInMessage: 'a negative safe integer',
    customConsts:
      'const abs = (x: WithSmallInt<ElementType>): PositiveSafeInt =>\n  PositiveSafeInt.fromNumber(Math.abs(x));',
    customKeys: ['abs'],
    namespaceKeys: [
      'is',
      'MIN_VALUE',
      'MAX_VALUE',
      'abs',
      'min',
      'max',
      'fromNumber',
      'random',
      'pow',
      'add',
      'sub',
    ],
    division: 'floor',
    hasExamples: false,
  },

  // --- operatorsForFloat families ---
  {
    pascalName: 'FiniteNumber',
    kebabName: 'finite-number',
    dir: 'branded-types',
    ttfType: 'FiniteNumber',
    elementTypeRhs: 'FiniteNumber',
    extraTtfTypes: ['Int', 'NonNegativeFiniteNumber'],
    factory: 'operatorsForFloat',
    generics: ['ElementType', 'number', 'number'],
    nonZero: false,
    minValueExpr: '-Number.MAX_VALUE',
    maxValueExpr: 'Number.MAX_VALUE',
    typeNameInMessage: 'a finite number',
    customConsts: floatRounding(TO_INT_RET, TO_INT_RET, TO_INT_RET),
    customKeys: ['floor', 'ceil', 'round'],
    leadingExpectType: `expectType<${TO_INT_RET}, Int>('=');`,
    trailingExpectTypeExtra: `expectType<TsDataForgeInternals.RefinedNumberUtils.ToNonNegative<ElementType>, NonNegativeFiniteNumber>('=');`,
    namespaceKeys: FLOAT_KEYS_UNBOUNDED_ABS,
    numberClassParams: 'never',
    division: 'exact',
    hasExamples: false,
  },
  {
    pascalName: 'NonNegativeFiniteNumber',
    kebabName: 'non-negative-finite-number',
    dir: 'branded-types',
    ttfType: 'NonNegativeFiniteNumber',
    elementTypeRhs: 'NonNegativeFiniteNumber',
    extraTtfTypes: ['Uint'],
    factory: 'operatorsForFloat',
    generics: ['ElementType', '0', 'number'],
    nonZero: false,
    minValueExpr: '0',
    maxValueExpr: 'Number.MAX_VALUE',
    typeNameInMessage: 'a non-negative finite number',
    customConsts: floatRounding(TO_INT_RET, TO_INT_RET, TO_INT_RET),
    customKeys: ['floor', 'ceil', 'round'],
    leadingExpectType: `expectType<${TO_INT_RET}, Uint>('=');`,
    namespaceKeys: FLOAT_KEYS_LOWER_BOUNDED,
    numberClassParams: "'non-negative'",
    division: 'exact',
    hasExamples: false,
  },
  {
    pascalName: 'NonZeroFiniteNumber',
    kebabName: 'non-zero-finite-number',
    dir: 'branded-types',
    ttfType: 'NonZeroFiniteNumber',
    elementTypeRhs: 'NonZeroFiniteNumber',
    extraTtfTypes: ['Int', 'NonZeroInt', 'PositiveFiniteNumber'],
    factory: 'operatorsForFloat',
    generics: ['ElementType', 'number', 'number'],
    nonZero: true,
    randomNonZero: true,
    minValueExpr: '-Number.MAX_VALUE',
    maxValueExpr: 'Number.MAX_VALUE',
    typeNameInMessage: 'a non-zero finite number',
    customConsts: floatRounding(TO_INT_RET, TO_INT_RET, TO_INT_RET),
    customKeys: ['floor', 'ceil', 'round'],
    leadingExpectType: [
      `expectType<${TO_INT_RET}, NonZeroInt>('=');`,
      `expectType<${REMOVE_NZ_RET}, Int>('=');`,
    ].join('\n\n'),
    trailingExpectTypeExtra: `expectType<TsDataForgeInternals.RefinedNumberUtils.ToNonNegative<ElementType>, PositiveFiniteNumber>('=');`,
    namespaceKeys: [
      'is',
      'abs',
      'min',
      'max',
      'floor',
      'ceil',
      'round',
      'random',
      'pow',
      'mul',
      'div',
    ],
    numberClassParams: "never, 'div' | 'mul'",
    division: 'exact',
    hasExamples: false,
    proseOverrides: {
      div: {
        description:
          'Divides two non-zero finite numbers, returning `a / b` as a `NonZeroFiniteNumber`.\n\nExact (non-flooring) division of two non-zero finite numbers is always non-zero, so this stays closed. For the non-closed operations (`add`/`sub`, whose result may be `0`) use {@link Num.add}/{@link Num.sub}.',
      },
    },
  },
  {
    pascalName: 'NonPositiveFiniteNumber',
    kebabName: 'non-positive-finite-number',
    dir: 'branded-types',
    ttfType: 'NonPositiveFiniteNumber',
    elementTypeRhs: 'NonPositiveFiniteNumber',
    factory: 'operatorsForFloat',
    generics: ['ElementType', 'number', '0'],
    nonZero: false,
    minValueExpr: 'Number.MAX_VALUE * -1',
    maxValueExpr: '0',
    typeNameInMessage: 'a non-positive finite number',
    customConsts: floatRounding(REMOVE_NZ_RET, REMOVE_NZ_RET, REMOVE_NZ_RET),
    customKeys: ['floor', 'ceil', 'round'],
    namespaceKeys: [
      'is',
      'MAX_VALUE',
      'min',
      'max',
      'fromNumber',
      'floor',
      'ceil',
      'round',
      'random',
      'pow',
      'add',
      'sub',
    ],
    division: 'exact',
    hasExamples: false,
  },
  {
    pascalName: 'PositiveFiniteNumber',
    kebabName: 'positive-finite-number',
    dir: 'branded-types',
    ttfType: 'PositiveFiniteNumber',
    elementTypeRhs: 'PositiveFiniteNumber',
    extraTtfTypes: ['PositiveInt', 'Uint'],
    factory: 'operatorsForFloat',
    generics: ['ElementType', 'number', 'number'],
    nonZero: false,
    minValueExpr: 'Number.MIN_VALUE',
    maxValueExpr: 'Number.MAX_VALUE',
    minValueNote:
      'The domain is open at `0` (excluded), so this is `Number.MIN_VALUE` — the smallest positive double — rather than `0`.',
    typeNameInMessage: 'a positive finite number',
    customConsts: floatRounding(REMOVE_NZ_RET, TO_INT_RET, REMOVE_NZ_RET),
    customKeys: ['floor', 'ceil', 'round'],
    leadingExpectType: [
      `expectType<${TO_INT_RET}, PositiveInt>('=');`,
      `expectType<${REMOVE_NZ_RET}, Uint>('=');`,
    ].join('\n\n'),
    namespaceKeys: FLOAT_KEYS_LOWER_BOUNDED,
    numberClassParams: "'positive'",
    division: 'exact',
    hasExamples: false,
  },
  {
    pascalName: 'NegativeFiniteNumber',
    kebabName: 'negative-finite-number',
    dir: 'branded-types',
    ttfType: 'NegativeFiniteNumber',
    elementTypeRhs: 'NegativeFiniteNumber',
    extraImports: [
      "import { PositiveFiniteNumber } from './positive-finite-number.mjs';",
    ],
    factory: 'operatorsForFloat',
    generics: ['ElementType', 'number', 'number'],
    nonZero: true,
    minValueExpr: '-Number.MAX_VALUE',
    maxValueExpr: '-Number.MIN_VALUE',
    maxValueNote:
      'The domain is open at `0` (excluded), so this is `-Number.MIN_VALUE` — the negative double closest to `0` — rather than `0`.',
    typeNameInMessage: 'a negative finite number',
    customConsts: [
      'const abs = (x: ElementType): PositiveFiniteNumber =>\n  PositiveFiniteNumber.fromNumber(Math.abs(x));',
      floatRounding(TO_INT_RET, REMOVE_NZ_RET, REMOVE_NZ_RET),
    ].join('\n\n'),
    customKeys: ['abs', 'floor', 'ceil', 'round'],
    namespaceKeys: [
      'is',
      'MAX_VALUE',
      'abs',
      'min',
      'max',
      'fromNumber',
      'floor',
      'ceil',
      'round',
      'random',
      'pow',
      'add',
      'sub',
    ],
    division: 'exact',
    hasExamples: false,
  },

  // --- enum modules ---
  {
    pascalName: 'Int8',
    kebabName: 'int8',
    dir: 'enum',
    ttfType: 'Int8',
    elementTypeRhs: 'Int8',
    factory: 'operatorsForInteger',
    generics: [],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '-128',
    maxValueExpr: '127',
    typeNameInMessage: 'an integer in [-128, 127]',
    namespaceKeys: [
      'is',
      'MIN_VALUE',
      'MAX_VALUE',
      'min',
      'max',
      'fromNumber',
      'abs',
      'random',
      'pow',
      'add',
      'sub',
      'mul',
      'div',
    ],
    numberClassParams: "'int' | 'range'",
    enumSpec: { wideBase: 'Int16', hasAbs: true },
    division: 'floor',
    hasExamples: false,
  },
  {
    pascalName: 'Uint8',
    kebabName: 'uint8',
    dir: 'enum',
    ttfType: 'Uint8',
    elementTypeRhs: 'Uint8',
    factory: 'operatorsForInteger',
    generics: [],
    integerOrSafeInteger: 'SafeInteger',
    nonZero: false,
    minValueExpr: '0',
    maxValueExpr: '255',
    // Grammatical typo ("an non-negative") preserved verbatim from the source.
    typeNameInMessage: 'an non-negative integer less than 256',
    namespaceKeys: [
      'is',
      'MIN_VALUE',
      'MAX_VALUE',
      'max',
      'min',
      'fromNumber',
      'random',
      'pow',
      'add',
      'sub',
      'mul',
      'div',
    ],
    numberClassParams: "'int' | 'non-negative' | 'range'",
    enumSpec: { wideBase: 'Uint16', hasAbs: false },
    division: 'floor',
    hasExamples: false,
  },
] as const;
