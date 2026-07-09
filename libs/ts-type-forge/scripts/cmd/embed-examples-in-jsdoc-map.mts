type SourceFileMapping = Readonly<{
  sourcePath: string;
  sampleFiles: readonly string[];
}>;

/**
 * Mapping from source files to their sample code files. Sample files must be
 * listed in the order their `@example` blocks appear in the source file (top
 * to bottom).
 */
export const sourceFileMappings: readonly SourceFileMapping[] = [
  {
    sourcePath: 'src/branded-types/bigint.mts',
    sampleFiles: [
      'samples/src/branded-types/big-int64-example.mts',
      'samples/src/branded-types/big-uint64-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/brand.mts',
    sampleFiles: [
      'samples/src/branded-types/brand-example.mts',
      'samples/src/branded-types/unwrap-brand-true-keys-example.mts',
      'samples/src/branded-types/unwrap-brand-false-keys-example.mts',
      'samples/src/branded-types/unwrap-brand-boolean-keys-example.mts',
      'samples/src/branded-types/unwrap-brand-keys-example.mts',
      'samples/src/branded-types/get-brand-keys-part-example.mts',
      'samples/src/branded-types/get-brand-value-part-example.mts',
      'samples/src/branded-types/extend-brand-example.mts',
      'samples/src/branded-types/change-base-brand-example.mts',
      'samples/src/branded-types/intersect-brand-example.mts',
      'samples/src/branded-types/normalize-brand-union-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/core.mts',
    sampleFiles: [
      'samples/src/branded-types/nan-type-example.mts',
      'samples/src/branded-types/valid-number-example.mts',
      'samples/src/branded-types/non-zero-number-example.mts',
      'samples/src/branded-types/non-negative-number-example.mts',
      'samples/src/branded-types/positive-number-example.mts',
      'samples/src/branded-types/non-positive-number-example.mts',
      'samples/src/branded-types/negative-number-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/finite-number.mts',
    sampleFiles: [
      'samples/src/branded-types/finite-number-example.mts',
      'samples/src/branded-types/infinite-number-example.mts',
      'samples/src/branded-types/positive-infinity-example.mts',
      'samples/src/branded-types/negative-infinity-example.mts',
      'samples/src/branded-types/non-negative-finite-number-example.mts',
      'samples/src/branded-types/positive-finite-number-example.mts',
      'samples/src/branded-types/negative-finite-number-example.mts',
      'samples/src/branded-types/non-zero-finite-number-example.mts',
      'samples/src/branded-types/non-positive-finite-number-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/float.mts',
    sampleFiles: [
      'samples/src/branded-types/float32-example.mts',
      'samples/src/branded-types/float64-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/int.mts',
    sampleFiles: [
      'samples/src/branded-types/int-example.mts',
      'samples/src/branded-types/non-zero-int-example.mts',
      'samples/src/branded-types/non-negative-int-example.mts',
      'samples/src/branded-types/uint-example.mts',
      'samples/src/branded-types/positive-int-example.mts',
      'samples/src/branded-types/negative-int-example.mts',
      'samples/src/branded-types/non-positive-int-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/int16.mts',
    sampleFiles: [
      'samples/src/branded-types/int16-example.mts',
      'samples/src/branded-types/non-zero-int16-example.mts',
      'samples/src/branded-types/non-negative-int16-example.mts',
      'samples/src/branded-types/positive-int16-example.mts',
      'samples/src/branded-types/negative-int16-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/int32.mts',
    sampleFiles: [
      'samples/src/branded-types/int32-example.mts',
      'samples/src/branded-types/non-zero-int32-example.mts',
      'samples/src/branded-types/non-negative-int32-example.mts',
      'samples/src/branded-types/positive-int32-example.mts',
      'samples/src/branded-types/negative-int32-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/safe-int.mts',
    sampleFiles: [
      'samples/src/branded-types/safe-int-example.mts',
      'samples/src/branded-types/non-zero-safe-int-example.mts',
      'samples/src/branded-types/safe-uint-example.mts',
      'samples/src/branded-types/positive-safe-int-example.mts',
      'samples/src/branded-types/negative-safe-int-example.mts',
      'samples/src/branded-types/non-positive-safe-int-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/small-int.mts',
    sampleFiles: [
      'samples/src/branded-types/small-int-example.mts',
      'samples/src/branded-types/small-uint-example.mts',
      'samples/src/branded-types/with-small-int-example.mts',
      'samples/src/branded-types/cast-to-int-example.mts',
      'samples/src/branded-types/exclude-small-int-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/uint16.mts',
    sampleFiles: [
      'samples/src/branded-types/uint16-example.mts',
      'samples/src/branded-types/positive-uint16-example.mts',
      'samples/src/branded-types/non-zero-uint16-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/uint32.mts',
    sampleFiles: [
      'samples/src/branded-types/uint32-example.mts',
      'samples/src/branded-types/positive-uint32-example.mts',
      'samples/src/branded-types/non-zero-uint32-example.mts',
    ],
  },
  {
    sourcePath: 'src/condition/extends.mts',
    sampleFiles: ['samples/src/condition/type-extends-example.mts'],
  },
  {
    sourcePath: 'src/constants/alphabet.mts',
    sampleFiles: [
      'samples/src/constants/lower-alphabet-example.mts',
      'samples/src/constants/upper-alphabet-example.mts',
      'samples/src/constants/alphabet-example.mts',
    ],
  },
  {
    sourcePath: 'src/constants/falsy-value.mts',
    sampleFiles: ['samples/src/constants/falsy-value-example.mts'],
  },
  {
    sourcePath: 'src/constants/int-enum.mts',
    sampleFiles: [
      'samples/src/constants/uint8-example.mts',
      'samples/src/constants/uint9-example.mts',
      'samples/src/constants/uint10-example.mts',
      'samples/src/constants/month-enum-example.mts',
      'samples/src/constants/month-index-enum-example.mts',
      'samples/src/constants/hours-enum-example.mts',
      'samples/src/constants/percent-example.mts',
    ],
  },
  {
    sourcePath: 'src/constants/primitive.mts',
    sampleFiles: ['samples/src/constants/primitive-example.mts'],
  },
  {
    sourcePath: 'src/constants/record.mts',
    sampleFiles: ['samples/src/constants/unknown-record-example.mts'],
  },
  {
    sourcePath: 'src/constants/web.mts',
    sampleFiles: ['samples/src/constants/http-request-method-example.mts'],
  },
  {
    sourcePath: 'src/others/boolean.mts',
    sampleFiles: [
      'samples/src/others/bool-not-example.mts',
      'samples/src/others/bool-and-example.mts',
      'samples/src/others/bool-or-example.mts',
    ],
  },
  {
    sourcePath: 'src/others/json.mts',
    sampleFiles: [
      'samples/src/others/json-primitive-example.mts',
      'samples/src/others/mutable-json-value-example.mts',
      'samples/src/others/json-value-example.mts',
      'samples/src/others/json-object-example.mts',
      'samples/src/others/mutable-json-object-example.mts',
    ],
  },
  {
    sourcePath: 'src/others/mutable.mts',
    sampleFiles: [
      'samples/src/others/mutable-example.mts',
      'samples/src/others/to-mutable-map-example.mts',
      'samples/src/others/to-mutable-set-example.mts',
      'samples/src/others/mutable-set-example.mts',
      'samples/src/others/mutable-map-example.mts',
    ],
  },
  {
    sourcePath: 'src/others/std.mts',
    sampleFiles: [
      'samples/src/others/strict-extract-example.mts',
      'samples/src/others/relaxed-extract-example.mts',
      'samples/src/others/strict-pick-example.mts',
      'samples/src/others/relaxed-pick-example.mts',
      'samples/src/others/strict-exclude-example.mts',
      'samples/src/others/relaxed-exclude-example.mts',
      'samples/src/others/strict-omit-example.mts',
      'samples/src/others/relaxed-omit-example.mts',
      'samples/src/others/readonly-record-example.mts',
      'samples/src/others/mutable-record-example.mts',
    ],
  },
  {
    sourcePath: 'src/others/widen-literal.mts',
    sampleFiles: ['samples/src/others/widen-literal-example.mts'],
  },
  {
    sourcePath: 'src/record/deep-pick-omit.mts',
    sampleFiles: [
      'samples/src/record/deep-pick-example.mts',
      'samples/src/record/deep-omit-example.mts',
    ],
  },
  {
    sourcePath: 'src/type-level-integer/increment.mts',
    sampleFiles: [
      'samples/src/type-level-integer/increment-example.mts',
      'samples/src/type-level-integer/decrement-example.mts',
    ],
  },
] as const;
