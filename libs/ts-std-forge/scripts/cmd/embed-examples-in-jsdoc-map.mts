type SourceFileMapping = Readonly<{
  sourcePath: string;
  sampleFiles: readonly string[];
}>;

/**
 * Mapping from source files to their sample code files. Moved here with the
 * algebraic data type core (Sumi D-49 stage 2). Sample files should be
 * listed in the order they appear in the source file's JSDoc.
 *
 * HOW TO USE:
 *
 * 1. In the source file JSDoc, add @example blocks:
 *
 * @example
 * ```ts
 * ```
 *
 * 2. Add the source file path and its sample files to this mapping in the order
 *   they appear in the source file (top to bottom).
 *
 * 3. Run: pnpm run doc:embed:jsdoc (or pnpm exec tsx scripts/cmd/embed-examples-in-jsdoc.mts)
 *
 * The script will replace each ```ts block sequentially with the corresponding sample code.
 */
export const sourceFileMappings: readonly SourceFileMapping[] = [
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-ok.mts',
    sampleFiles: ['samples/src/functional/ternary-result/ok-example.mts'],
  },
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-warn.mts',
    sampleFiles: ['samples/src/functional/ternary-result/warn-example.mts'],
  },
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-err.mts',
    sampleFiles: ['samples/src/functional/ternary-result/err-example.mts'],
  },
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-is-ok.mts',
    sampleFiles: ['samples/src/functional/ternary-result/is-ok-example.mts'],
  },
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-is-warn.mts',
    sampleFiles: ['samples/src/functional/ternary-result/is-warn-example.mts'],
  },
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-is-err.mts',
    sampleFiles: ['samples/src/functional/ternary-result/is-err-example.mts'],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-is-ternary-result.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/is-ternary-result-example.mts',
    ],
  },
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-map.mts',
    sampleFiles: ['samples/src/functional/ternary-result/map-example.mts'],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-map-warn.mts',
    sampleFiles: ['samples/src/functional/ternary-result/map-warn-example.mts'],
  },
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-map-err.mts',
    sampleFiles: ['samples/src/functional/ternary-result/map-err-example.mts'],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-flat-map.mts',
    sampleFiles: ['samples/src/functional/ternary-result/flat-map-example.mts'],
  },
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-fold.mts',
    sampleFiles: ['samples/src/functional/ternary-result/fold-example.mts'],
  },
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-or-else.mts',
    sampleFiles: ['samples/src/functional/ternary-result/or-else-example.mts'],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-to-optional.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/to-optional-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-expect-to-be.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/expect-to-be-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-unwrap-ok.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/unwrap-ok-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-unwrap-ok-or.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/unwrap-ok-or-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-unwrap-warn.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/unwrap-warn-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-unwrap-warn-or.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/unwrap-warn-or-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-unwrap-warn-throw.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/unwrap-warn-throw-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-unwrap-err.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/unwrap-err-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-unwrap-err-or.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/unwrap-err-or-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-unwrap-err-throw.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/unwrap-err-throw-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-unwrap-throw.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/unwrap-throw-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-from-promise.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/from-promise-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/ternary-result/impl/ternary-result-from-throwable.mts',
    sampleFiles: [
      'samples/src/functional/ternary-result/from-throwable-example.mts',
    ],
  },
  {
    sourcePath: 'src/functional/ternary-result/impl/ternary-result-zip.mts',
    sampleFiles: ['samples/src/functional/ternary-result/zip-example.mts'],
  },
  {
    sourcePath: 'src/functional/match.mts',
    sampleFiles: ['samples/src/functional/match/match-exhaustive-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-expect-to-be.mts',
    sampleFiles: ['samples/src/functional/optional/expect-to-be-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-filter.mts',
    sampleFiles: ['samples/src/functional/optional/filter-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-flat-map.mts',
    sampleFiles: ['samples/src/functional/optional/flat-map-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-from-nullable.mts',
    sampleFiles: ['samples/src/functional/optional/from-nullable-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-is-none.mts',
    sampleFiles: ['samples/src/functional/optional/is-none-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-is-optional.mts',
    sampleFiles: ['samples/src/functional/optional/is-optional-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-is-some.mts',
    sampleFiles: ['samples/src/functional/optional/is-some-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-map.mts',
    sampleFiles: ['samples/src/functional/optional/map-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-match.mts',
    sampleFiles: ['samples/src/functional/optional/match-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-none.mts',
    sampleFiles: ['samples/src/functional/optional/some-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-or-else.mts',
    sampleFiles: ['samples/src/functional/optional/or-else-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-some.mts',
    sampleFiles: ['samples/src/functional/optional/some-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-to-nullable.mts',
    sampleFiles: ['samples/src/functional/optional/to-nullable-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-unwrap-or.mts',
    sampleFiles: ['samples/src/functional/optional/unwrap-or-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-unwrap-throw.mts',
    sampleFiles: ['samples/src/functional/optional/unwrap-throw-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-unwrap.mts',
    sampleFiles: ['samples/src/functional/optional/unwrap-example.mts'],
  },
  {
    sourcePath: 'src/functional/optional/impl/optional-zip.mts',
    sampleFiles: ['samples/src/functional/optional/zip-example.mts'],
  },
  {
    sourcePath: 'src/functional/pipe.mts',
    sampleFiles: [
      'samples/src/functional/pipe/pipe-map-example.mts',
      'samples/src/functional/pipe/pipe-map-nullable-example.mts',
      'samples/src/functional/pipe/pipe-map-optional-example.mts',
    ],
  },
  {
    sourcePath: 'src/functional/result/impl/result-is-result.mts',
    sampleFiles: ['samples/src/functional/result/is-result-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-ok.mts',
    sampleFiles: ['samples/src/functional/result/ok-err-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-err.mts',
    sampleFiles: ['samples/src/functional/result/ok-err-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-is-ok.mts',
    sampleFiles: ['samples/src/functional/result/is-ok-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-is-err.mts',
    sampleFiles: ['samples/src/functional/result/is-ok-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-unwrap-throw.mts',
    sampleFiles: ['samples/src/functional/result/unwrap-throw-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-unwrap-ok.mts',
    sampleFiles: ['samples/src/functional/result/unwrap-ok-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-unwrap-ok-or.mts',
    sampleFiles: ['samples/src/functional/result/unwrap-ok-or-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-unwrap-err-throw.mts',
    sampleFiles: ['samples/src/functional/result/unwrap-err-throw-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-unwrap-err.mts',
    sampleFiles: ['samples/src/functional/result/unwrap-err-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-unwrap-err-or.mts',
    sampleFiles: ['samples/src/functional/result/unwrap-err-or-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-map.mts',
    sampleFiles: ['samples/src/functional/result/map-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-map-err.mts',
    sampleFiles: ['samples/src/functional/result/map-err-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-fold.mts',
    sampleFiles: ['samples/src/functional/result/fold-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-flat-map.mts',
    sampleFiles: ['samples/src/functional/result/flat-map-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-expect-to-be.mts',
    sampleFiles: ['samples/src/functional/result/expect-to-be-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-from-promise.mts',
    sampleFiles: ['samples/src/functional/result/from-promise-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-from-throwable.mts',
    sampleFiles: ['samples/src/functional/result/from-throwable-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-swap.mts',
    sampleFiles: ['samples/src/functional/result/swap-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-to-optional.mts',
    sampleFiles: ['samples/src/functional/result/to-optional-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-or-else.mts',
    sampleFiles: ['samples/src/functional/result/or-else-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-zip.mts',
    sampleFiles: ['samples/src/functional/result/zip-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-match.mts',
    sampleFiles: ['samples/src/functional/result/match-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-from-optional.mts',
    sampleFiles: ['samples/src/functional/result/from-optional-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-safe-try.mts',
    sampleFiles: ['samples/src/functional/result/safe-try-example.mts'],
  },
  {
    sourcePath: 'src/functional/result/impl/result-safe-unwrap.mts',
    sampleFiles: ['samples/src/functional/result/safe-unwrap-example.mts'],
  },
  {
    sourcePath: 'src/guard/has-key.mts',
    sampleFiles: ['samples/src/guard/has-key/has-key-example.mts'],
  },
  {
    sourcePath: 'src/guard/is-non-null-object.mts',
    sampleFiles: [
      'samples/src/guard/is-non-null-object/is-non-null-object-example.mts',
    ],
  },
  {
    sourcePath: 'src/guard/is-record.mts',
    sampleFiles: [
      'samples/src/guard/is-record/is-record-example.mts',
      'samples/src/guard/is-record/is-mutable-record-example.mts',
    ],
  },
  {
    sourcePath: 'src/guard/key-is-in.mts',
    sampleFiles: ['samples/src/guard/key-is-in/key-is-in-example.mts'],
  },
  {
    sourcePath: 'src/functional/async-result/impl/async-result-flat-map.mts',
    sampleFiles: ['samples/src/functional/async-result/flat-map-example.mts'],
  },
  {
    sourcePath:
      'src/functional/async-result/impl/async-result-from-promise.mts',
    sampleFiles: [
      'samples/src/functional/async-result/from-promise-example.mts',
    ],
  },
  {
    sourcePath:
      'src/functional/async-result/impl/async-result-from-throwable.mts',
    sampleFiles: [
      'samples/src/functional/async-result/from-throwable-example.mts',
    ],
  },
  {
    sourcePath: 'src/functional/async-result/impl/async-result-map.mts',
    sampleFiles: ['samples/src/functional/async-result/map-example.mts'],
  },
  {
    sourcePath: 'src/functional/async-result/impl/async-result-map-err.mts',
    sampleFiles: ['samples/src/functional/async-result/map-err-example.mts'],
  },
  {
    sourcePath: 'src/functional/async-result/impl/async-result-unwrap-or.mts',
    sampleFiles: ['samples/src/functional/async-result/unwrap-or-example.mts'],
  },
  {
    sourcePath: 'src/panic/panic.mts',
    sampleFiles: [
      'samples/src/panic/panic-message-example.mts',
      'samples/src/panic/panic-error-example.mts',
      'samples/src/panic/unreachable-example.mts',
      'samples/src/panic/todo-example.mts',
    ],
  },
  {
    sourcePath: 'src/regex/impl/create.mts',
    sampleFiles: ['samples/src/regex/create-example.mts'],
  },
  {
    sourcePath: 'src/safe-array/impl/create.mts',
    sampleFiles: ['samples/src/safe-array/create-example.mts'],
  },
  {
    sourcePath: 'src/safe-array/impl/is-array.mts',
    sampleFiles: ['samples/src/safe-array/is-array-example.mts'],
  },
  {
    sourcePath: 'src/safe-array/impl/is-empty.mts',
    sampleFiles: ['samples/src/safe-array/is-empty-example.mts'],
  },
  {
    sourcePath: 'src/safe-array/impl/is-non-empty.mts',
    sampleFiles: ['samples/src/safe-array/is-non-empty-example.mts'],
  },
  {
    sourcePath: 'src/safe-date/impl/to-iso-string.mts',
    sampleFiles: ['samples/src/safe-date/to-iso-string-example.mts'],
  },
  {
    sourcePath: 'src/safe-number/impl/parse.mts',
    sampleFiles: ['samples/src/safe-number/parse-example.mts'],
  },
  {
    sourcePath: 'src/safe-number/impl/parse-integer.mts',
    sampleFiles: ['samples/src/safe-number/parse-integer-example.mts'],
  },
  {
    sourcePath: 'src/safe-number/impl/to-exponential.mts',
    sampleFiles: ['samples/src/safe-number/to-exponential-example.mts'],
  },
  {
    sourcePath: 'src/safe-number/impl/to-fixed.mts',
    sampleFiles: ['samples/src/safe-number/to-fixed-example.mts'],
  },
  {
    sourcePath: 'src/safe-number/impl/to-precision.mts',
    sampleFiles: ['samples/src/safe-number/to-precision-example.mts'],
  },
  {
    sourcePath: 'src/safe-number/impl/to-string-with-radix.mts',
    sampleFiles: ['samples/src/safe-number/to-string-with-radix-example.mts'],
  },
  {
    sourcePath: 'src/safe-string/impl/from-code-point.mts',
    sampleFiles: ['samples/src/safe-string/from-code-point-example.mts'],
  },
  {
    sourcePath: 'src/safe-string/impl/from-primitive.mts',
    sampleFiles: ['samples/src/safe-string/from-primitive-example.mts'],
  },
  {
    sourcePath: 'src/safe-string/impl/normalize.mts',
    sampleFiles: ['samples/src/safe-string/normalize-example.mts'],
  },
  {
    sourcePath: 'src/safe-string/impl/repeat.mts',
    sampleFiles: ['samples/src/safe-string/repeat-example.mts'],
  },
] as const;
