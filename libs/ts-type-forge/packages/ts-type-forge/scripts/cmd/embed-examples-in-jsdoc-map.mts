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
    sourcePath:
      'src/branded-types/predefined-arrays/length-constrained-array.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-arrays/max-length-array-example.mts',
      'samples/src/branded-types/predefined-arrays/mutable-max-length-array-example.mts',
      'samples/src/branded-types/predefined-arrays/min-length-array-example.mts',
      'samples/src/branded-types/predefined-arrays/mutable-min-length-array-example.mts',
      'samples/src/branded-types/predefined-arrays/bounded-length-array-example.mts',
      'samples/src/branded-types/predefined-arrays/mutable-bounded-length-array-example.mts',
      'samples/src/branded-types/predefined-arrays/fixed-length-array-example.mts',
      'samples/src/branded-types/predefined-arrays/mutable-fixed-length-array-example.mts',
    ],
  },
  {
    sourcePath:
      'src/branded-types/predefined-arrays/length-constrained-array-bounds.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-arrays/has-length-constraint-example.mts',
      'samples/src/branded-types/predefined-arrays/min-length-of-example.mts',
      'samples/src/branded-types/predefined-arrays/max-length-of-example.mts',
      'samples/src/branded-types/predefined-arrays/change-array-element-example.mts',
    ],
  },
  {
    sourcePath:
      'src/branded-types/predefined-arrays/length-constrained-array-ops.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-arrays/constrained-list-example.mts',
      'samples/src/branded-types/predefined-arrays/normalize-length-constraint-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/bigint.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/big-int64-example.mts',
      'samples/src/branded-types/predefined-numbers/big-uint64-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/core.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/nan-type-example.mts',
      'samples/src/branded-types/predefined-numbers/valid-number-example.mts',
      'samples/src/branded-types/predefined-numbers/non-zero-number-example.mts',
      'samples/src/branded-types/predefined-numbers/non-negative-number-example.mts',
      'samples/src/branded-types/predefined-numbers/positive-number-example.mts',
      'samples/src/branded-types/predefined-numbers/non-positive-number-example.mts',
      'samples/src/branded-types/predefined-numbers/negative-number-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/finite-number.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/finite-number-example.mts',
      'samples/src/branded-types/predefined-numbers/infinite-number-example.mts',
      'samples/src/branded-types/predefined-numbers/positive-infinity-example.mts',
      'samples/src/branded-types/predefined-numbers/negative-infinity-example.mts',
      'samples/src/branded-types/predefined-numbers/non-negative-finite-number-example.mts',
      'samples/src/branded-types/predefined-numbers/positive-finite-number-example.mts',
      'samples/src/branded-types/predefined-numbers/negative-finite-number-example.mts',
      'samples/src/branded-types/predefined-numbers/non-zero-finite-number-example.mts',
      'samples/src/branded-types/predefined-numbers/non-positive-finite-number-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/float.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/float16-example.mts',
      'samples/src/branded-types/predefined-numbers/float32-example.mts',
      'samples/src/branded-types/predefined-numbers/float64-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/int.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/int-example.mts',
      'samples/src/branded-types/predefined-numbers/non-zero-int-example.mts',
      'samples/src/branded-types/predefined-numbers/non-negative-int-example.mts',
      'samples/src/branded-types/predefined-numbers/uint-example.mts',
      'samples/src/branded-types/predefined-numbers/positive-int-example.mts',
      'samples/src/branded-types/predefined-numbers/negative-int-example.mts',
      'samples/src/branded-types/predefined-numbers/non-positive-int-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/int16.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/int16-example.mts',
      'samples/src/branded-types/predefined-numbers/non-zero-int16-example.mts',
      'samples/src/branded-types/predefined-numbers/non-negative-int16-example.mts',
      'samples/src/branded-types/predefined-numbers/positive-int16-example.mts',
      'samples/src/branded-types/predefined-numbers/negative-int16-example.mts',
      'samples/src/branded-types/predefined-numbers/non-positive-int16-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/int32.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/int32-example.mts',
      'samples/src/branded-types/predefined-numbers/non-zero-int32-example.mts',
      'samples/src/branded-types/predefined-numbers/non-negative-int32-example.mts',
      'samples/src/branded-types/predefined-numbers/positive-int32-example.mts',
      'samples/src/branded-types/predefined-numbers/negative-int32-example.mts',
      'samples/src/branded-types/predefined-numbers/non-positive-int32-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/safe-int.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/safe-int-example.mts',
      'samples/src/branded-types/predefined-numbers/non-zero-safe-int-example.mts',
      'samples/src/branded-types/predefined-numbers/safe-uint-example.mts',
      'samples/src/branded-types/predefined-numbers/positive-safe-int-example.mts',
      'samples/src/branded-types/predefined-numbers/negative-safe-int-example.mts',
      'samples/src/branded-types/predefined-numbers/non-positive-safe-int-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/small-int.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/small-int-example.mts',
      'samples/src/branded-types/predefined-numbers/small-uint-example.mts',
      'samples/src/branded-types/predefined-numbers/with-small-int-example.mts',
      'samples/src/branded-types/predefined-numbers/cast-to-int-example.mts',
      'samples/src/branded-types/predefined-numbers/exclude-small-int-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/uint16.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/uint16-example.mts',
      'samples/src/branded-types/predefined-numbers/positive-uint16-example.mts',
      'samples/src/branded-types/predefined-numbers/non-zero-uint16-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-numbers/uint32.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-numbers/uint32-example.mts',
      'samples/src/branded-types/predefined-numbers/positive-uint32-example.mts',
      'samples/src/branded-types/predefined-numbers/non-zero-uint32-example.mts',
    ],
  },
  {
    sourcePath:
      'src/branded-types/predefined-strings/length-constrained-string.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-strings/max-length-string-example.mts',
      'samples/src/branded-types/predefined-strings/min-length-string-example.mts',
      'samples/src/branded-types/predefined-strings/bounded-length-string-example.mts',
      'samples/src/branded-types/predefined-strings/fixed-length-string-example.mts',
    ],
  },
  {
    sourcePath: 'src/branded-types/predefined-strings/non-empty-string.mts',
    sampleFiles: [
      'samples/src/branded-types/predefined-strings/non-empty-string-example.mts',
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
      'samples/src/others/bool-eq-example.mts',
      'samples/src/others/bool-nand-example.mts',
      'samples/src/others/bool-nor-example.mts',
      'samples/src/others/bool-neq-example.mts',
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
    sourcePath: 'src/others/utils.mts',
    sampleFiles: [
      'samples/src/others/to-string-example.mts',
      'samples/src/others/to-number-example.mts',
      'samples/src/others/value-of-example.mts',
      'samples/src/others/length-example.mts',
      'samples/src/others/union-to-intersection-example.mts',
      'samples/src/others/merge-intersection-example.mts',
      'samples/src/others/intersection-example.mts',
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
  {
    sourcePath: 'src/condition/eq.mts',
    sampleFiles: ['samples/src/condition/type-eq-example.mts'],
  },
  {
    sourcePath: 'src/condition/is-any.mts',
    sampleFiles: [
      'samples/src/condition/is-any-example.mts',
      'samples/src/condition/is-not-any-example.mts',
    ],
  },
  {
    sourcePath: 'src/condition/is-fixed-length-list.mts',
    sampleFiles: [
      'samples/src/condition/is-fixed-length-list-example.mts',
      'samples/src/condition/is-not-fixed-length-list-example.mts',
    ],
  },
  {
    sourcePath: 'src/condition/is-never.mts',
    sampleFiles: ['samples/src/condition/is-never-example.mts'],
  },
  {
    sourcePath: 'src/condition/is-union.mts',
    sampleFiles: ['samples/src/condition/is-union-example.mts'],
  },
  {
    sourcePath: 'src/condition/is-unknown.mts',
    sampleFiles: [
      'samples/src/condition/is-unknown-example.mts',
      'samples/src/condition/is-not-unknown-example.mts',
    ],
  },
  {
    sourcePath: 'src/others/bivariant-hack.mts',
    sampleFiles: ['samples/src/others/bivariant-hack-example.mts'],
  },
  {
    sourcePath: 'src/record/deep.mts',
    sampleFiles: [
      'samples/src/record/deep-readonly-example.mts',
      'samples/src/record/deep-mutable-example.mts',
      'samples/src/record/deep-partial-example.mts',
      'samples/src/record/deep-required-example.mts',
    ],
  },
  {
    sourcePath: 'src/record/partial.mts',
    sampleFiles: [
      'samples/src/record/partially-partial-example.mts',
      'samples/src/record/partially-optional-example.mts',
      'samples/src/record/partially-nullable-example.mts',
      'samples/src/record/partially-required-example.mts',
      'samples/src/record/optional-keys-example.mts',
      'samples/src/record/required-keys-example.mts',
    ],
  },
  {
    sourcePath: 'src/record/record-path.mts',
    sampleFiles: [
      'samples/src/record/record-paths-with-index-example.mts',
      'samples/src/record/record-paths-example.mts',
      'samples/src/record/record-path-and-value-type-tuple-example.mts',
      'samples/src/record/record-leaf-paths-example.mts',
      'samples/src/record/record-leaf-paths-with-index-example.mts',
      'samples/src/record/record-updated-example.mts',
      'samples/src/record/record-value-at-path-example.mts',
      'samples/src/record/record-value-at-path-with-index-example.mts',
    ],
  },
  {
    sourcePath: 'src/tuple-and-list/array.mts',
    sampleFiles: [
      'samples/src/tuple-and-list/mutable-non-empty-tuple-example.mts',
      'samples/src/tuple-and-list/non-empty-tuple-example.mts',
      'samples/src/tuple-and-list/non-empty-array-example.mts',
      'samples/src/tuple-and-list/array-element-example.mts',
    ],
  },
  {
    sourcePath: 'src/tuple-and-list/index-of-tuple.mts',
    sampleFiles: [
      'samples/src/tuple-and-list/index-of-tuple-example.mts',
      'samples/src/tuple-and-list/negative-index-of-tuple-example.mts',
    ],
  },
  {
    sourcePath: 'src/tuple-and-list/length-constrained-tuple.mts',
    sampleFiles: [
      'samples/src/tuple-and-list/fixed-length-tuple-example.mts',
      'samples/src/tuple-and-list/mutable-fixed-length-tuple-example.mts',
      'samples/src/tuple-and-list/mutable-min-length-tuple-example.mts',
      'samples/src/tuple-and-list/min-length-tuple-example.mts',
      'samples/src/tuple-and-list/bounded-length-tuple-example.mts',
      'samples/src/tuple-and-list/mutable-bounded-length-tuple-example.mts',
      'samples/src/tuple-and-list/max-length-tuple-example.mts',
      'samples/src/tuple-and-list/mutable-max-length-tuple-example.mts',
    ],
  },
  {
    sourcePath: 'src/tuple-and-list/list.mts',
    sampleFiles: [
      'samples/src/tuple-and-list/list-head-example.mts',
      'samples/src/tuple-and-list/list-last-example.mts',
      'samples/src/tuple-and-list/list-but-last-example.mts',
      'samples/src/tuple-and-list/list-tail-example.mts',
      'samples/src/tuple-and-list/list-reverse-example.mts',
      'samples/src/tuple-and-list/list-take-example.mts',
      'samples/src/tuple-and-list/list-skip-example.mts',
      'samples/src/tuple-and-list/list-take-last-example.mts',
      'samples/src/tuple-and-list/list-skip-last-example.mts',
      'samples/src/tuple-and-list/list-set-at-example.mts',
      'samples/src/tuple-and-list/list-flatten-example.mts',
      'samples/src/tuple-and-list/list-concat-example.mts',
      'samples/src/tuple-and-list/list-zip-example.mts',
      'samples/src/tuple-and-list/list-partition-example.mts',
    ],
  },
  {
    sourcePath: 'src/tuple-and-list/make-tuple.mts',
    sampleFiles: ['samples/src/tuple-and-list/make-tuple-example.mts'],
  },
  {
    sourcePath: 'src/tuple-and-list/tuple.mts',
    sampleFiles: [
      'samples/src/tuple-and-list/tuple-head-example.mts',
      'samples/src/tuple-and-list/tuple-last-example.mts',
      'samples/src/tuple-and-list/tuple-but-last-example.mts',
      'samples/src/tuple-and-list/tuple-tail-example.mts',
      'samples/src/tuple-and-list/tuple-reverse-example.mts',
      'samples/src/tuple-and-list/tuple-take-example.mts',
      'samples/src/tuple-and-list/tuple-skip-example.mts',
      'samples/src/tuple-and-list/tuple-take-last-example.mts',
      'samples/src/tuple-and-list/tuple-skip-last-example.mts',
      'samples/src/tuple-and-list/tuple-set-at-example.mts',
      'samples/src/tuple-and-list/tuple-flatten-example.mts',
      'samples/src/tuple-and-list/tuple-concat-example.mts',
      'samples/src/tuple-and-list/tuple-zip-example.mts',
      'samples/src/tuple-and-list/tuple-partition-example.mts',
    ],
  },
  {
    sourcePath: 'src/type-level-integer/abs.mts',
    sampleFiles: [
      'samples/src/type-level-integer/absolute-value-example.mts',
      'samples/src/type-level-integer/abs-example.mts',
    ],
  },
  {
    sourcePath: 'src/type-level-integer/index-type.mts',
    sampleFiles: [
      'samples/src/type-level-integer/index-example.mts',
      'samples/src/type-level-integer/index-inclusive-example.mts',
      'samples/src/type-level-integer/negative-index-example.mts',
    ],
  },
  {
    sourcePath: 'src/type-level-integer/int-range.mts',
    sampleFiles: [
      'samples/src/type-level-integer/int-range-example.mts',
      'samples/src/type-level-integer/int-range-inclusive-example.mts',
    ],
  },
  {
    sourcePath: 'src/type-level-integer/max.mts',
    sampleFiles: ['samples/src/type-level-integer/max-example.mts'],
  },
  {
    sourcePath: 'src/type-level-integer/min.mts',
    sampleFiles: ['samples/src/type-level-integer/min-example.mts'],
  },
  {
    sourcePath: 'src/type-level-integer/seq.mts',
    sampleFiles: ['samples/src/type-level-integer/seq-example.mts'],
  },
  {
    sourcePath: 'src/type-level-integer/uint-range.mts',
    sampleFiles: [
      'samples/src/type-level-integer/uint-range-example.mts',
      'samples/src/type-level-integer/uint-range-inclusive-example.mts',
    ],
  },
] as const;
