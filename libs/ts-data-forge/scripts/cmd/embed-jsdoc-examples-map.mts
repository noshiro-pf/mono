type SourceFileMapping = Readonly<{
  sourcePath: string;
  sampleFiles: readonly string[];
}>;

/**
 * Mapping from source files to their sample code files. Sample files should be
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
 * 3. Run: pnpm run doc:embed-jsdoc (or pnpm exec tsx scripts/cmd/embed-jsdoc-examples.mts)
 *
 * The script will replace each ```ts block sequentially with the corresponding sample code.
 */
export const sourceFileMappings: readonly SourceFileMapping[] = [
  {
    sourcePath: 'src/array/impl/array-utils-creation.mts',
    sampleFiles: [
      'samples/src/array/zeros-example.mts',
      'samples/src/array/seq-example.mts',
      'samples/src/array/create-example.mts',
      'samples/src/array/generate-example.mts',
      'samples/src/array/generate-async-example.mts',
      'samples/src/array/copy-example.mts',
      'samples/src/array/range-example.mts',
    ],
  },
  {
    sourcePath: 'src/array/impl/array-utils-size.mts',
    sampleFiles: ['samples/src/array/size-example.mts'],
  },
  {
    sourcePath: 'src/array/impl/array-utils-element-access.mts',
    sampleFiles: [
      'samples/src/array/at-example.mts',
      'samples/src/array/head-example.mts',
      'samples/src/array/last-example.mts',
    ],
  },
  {
    sourcePath: 'src/array/impl/array-utils-validation.mts',
    sampleFiles: [
      'samples/src/array/is-array-example.mts',
      'samples/src/array/is-empty-example.mts',
      'samples/src/array/is-non-empty-example.mts',
      'samples/src/array/is-array-of-length-example.mts',
      'samples/src/array/is-array-at-least-length-example.mts',
      'samples/src/array/every-example.mts',
      'samples/src/array/some-example.mts',
      'samples/src/array/index-is-in-range-example.mts',
    ],
  },
  {
    sourcePath: 'src/array/impl/array-utils-iterators.mts',
    sampleFiles: [
      'samples/src/array/entries-example.mts',
      'samples/src/array/values-example.mts',
      'samples/src/array/indices-example.mts',
    ],
  },
  {
    sourcePath: 'src/array/impl/array-utils-modification.mts',
    sampleFiles: [
      'samples/src/array/set-example.mts',
      'samples/src/array/to-updated-example.mts',
      'samples/src/array/to-inserted-example.mts',
      'samples/src/array/to-removed-example.mts',
      'samples/src/array/to-pushed-example.mts',
      'samples/src/array/to-unshifted-example.mts',
      'samples/src/array/to-filled-example.mts',
      'samples/src/array/to-range-filled-example.mts',
    ],
  },
  {
    sourcePath: 'src/array/impl/array-utils-slicing.mts',
    sampleFiles: [
      'samples/src/array/tail-example.mts',
      'samples/src/array/but-last-example.mts',
      'samples/src/array/take-example.mts',
      'samples/src/array/take-last-example.mts',
      'samples/src/array/skip-example.mts',
      'samples/src/array/skip-last-example.mts',
    ],
  },
  {
    sourcePath: 'src/array/impl/array-utils-slice-clamped.mts',
    sampleFiles: ['samples/src/array/slice-clamped-example.mts'],
  },
  {
    sourcePath: 'src/array/impl/array-utils-search.mts',
    sampleFiles: [
      'samples/src/array/find-example.mts',
      'samples/src/array/find-last-example.mts',
      'samples/src/array/find-index-example.mts',
      'samples/src/array/find-last-index-example.mts',
      'samples/src/array/index-of-example.mts',
      'samples/src/array/index-of-from-example.mts',
      'samples/src/array/last-index-of-example.mts',
      'samples/src/array/last-index-of-from-example.mts',
    ],
  },
  {
    sourcePath: 'src/array/impl/array-utils-reducing-value.mts',
    sampleFiles: [
      'samples/src/array/min-example.mts',
      'samples/src/array/max-example.mts',
      'samples/src/array/min-by-example.mts',
      'samples/src/array/max-by-example.mts',
      'samples/src/array/count-example.mts',
      'samples/src/array/count-by-example.mts',
      'samples/src/array/foldl-example.mts',
      'samples/src/array/foldr-example.mts',
      'samples/src/array/sum-example.mts',
      'samples/src/array/join-example.mts',
    ],
  },
  {
    sourcePath: 'src/array/impl/array-utils-transformation.mts',
    sampleFiles: [
      'samples/src/array/map-example.mts',
      'samples/src/array/scan-example.mts',
      'samples/src/array/to-reversed-example.mts',
      'samples/src/array/to-sorted-example.mts',
      'samples/src/array/to-sorted-by-example.mts',
      'samples/src/array/filter-example.mts',
      'samples/src/array/filter-not-example.mts',
      'samples/src/array/uniq-example.mts',
      'samples/src/array/uniq-by-example.mts',
      'samples/src/array/flat-example.mts',
      'samples/src/array/flat-map-example.mts',
      'samples/src/array/partition-example.mts',
      'samples/src/array/concat-example.mts',
      'samples/src/array/group-by-example.mts',
      'samples/src/array/zip-example.mts',
    ],
  },
  {
    sourcePath: 'src/array/impl/array-utils-set-op.mts',
    sampleFiles: [
      'samples/src/array/eq-example.mts',
      'samples/src/array/is-subset-example.mts',
      'samples/src/array/is-superset-example.mts',
      'samples/src/array/set-intersection-example.mts',
      'samples/src/array/set-difference-example.mts',
      'samples/src/array/sorted-num-set-difference-example.mts',
    ],
  },
  {
    sourcePath: 'src/collections/imap.mts',
    sampleFiles: [
      'samples/src/collections/imap/size-example.mts',
      'samples/src/collections/imap/has-example.mts',
      'samples/src/collections/imap/get-example.mts',
      'samples/src/collections/imap/every-example.mts',
      'samples/src/collections/imap/some-example.mts',
      'samples/src/collections/imap/delete-example.mts',
      'samples/src/collections/imap/set-example.mts',
      'samples/src/collections/imap/update-example.mts',
      'samples/src/collections/imap/with-mutations-example.mts',
      'samples/src/collections/imap/map-example.mts',
      'samples/src/collections/imap/map-keys-example.mts',
      'samples/src/collections/imap/map-entries-example.mts',
      'samples/src/collections/imap/for-each-example.mts',
      'samples/src/collections/imap/keys-method-example.mts',
      'samples/src/collections/imap/values-method-example.mts',
      'samples/src/collections/imap/entries-method-example.mts',
      'samples/src/collections/imap/to-keys-array-example.mts',
      'samples/src/collections/imap/to-values-array-example.mts',
      'samples/src/collections/imap/to-entries-array-example.mts',
      'samples/src/collections/imap/to-array-example.mts',
      'samples/src/collections/imap/to-raw-map-example.mts',
      'samples/src/collections/imap/create-example.mts',
      'samples/src/collections/imap/equal-example.mts',
      'samples/src/collections/imap/iterator-example.mts',
    ],
  },
  {
    sourcePath: 'src/collections/iset-mapped.mts',
    sampleFiles: [
      'samples/src/collections/iset-mapped/size-example.mts',
      'samples/src/collections/iset-mapped/is-empty-example.mts',
      'samples/src/collections/iset-mapped/has-example.mts',
      'samples/src/collections/iset-mapped/every-example.mts',
      'samples/src/collections/iset-mapped/some-example.mts',
      'samples/src/collections/iset-mapped/add-example.mts',
      'samples/src/collections/iset-mapped/delete-example.mts',
      'samples/src/collections/iset-mapped/with-mutations-example.mts',
      'samples/src/collections/iset-mapped/map-example.mts',
      'samples/src/collections/iset-mapped/filter-example.mts',
      'samples/src/collections/iset-mapped/filter-not-example.mts',
      'samples/src/collections/iset-mapped/for-each-example.mts',
      'samples/src/collections/iset-mapped/is-subset-of-example.mts',
      'samples/src/collections/iset-mapped/is-superset-of-example.mts',
      'samples/src/collections/iset-mapped/subtract-example.mts',
      'samples/src/collections/iset-mapped/intersect-example.mts',
      'samples/src/collections/iset-mapped/union-example.mts',
      'samples/src/collections/iset-mapped/keys-example.mts',
      'samples/src/collections/iset-mapped/values-example.mts',
      'samples/src/collections/iset-mapped/entries-example.mts',
      'samples/src/collections/iset-mapped/to-array-example.mts',
      'samples/src/collections/iset-mapped/to-raw-set-example.mts',
      'samples/src/collections/iset-mapped/create-example.mts',
      'samples/src/collections/iset-mapped/equal-example.mts',
      'samples/src/collections/iset-mapped/diff-example.mts',
      'samples/src/collections/iset-mapped/intersection-function-example.mts',
      'samples/src/collections/iset-mapped/union-function-example.mts',
      'samples/src/collections/iset-mapped/iterator-example.mts',
    ],
  },
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
    sourcePath: 'src/collections/iset.mts',
    sampleFiles: [
      'samples/src/collections/iset/size-example.mts',
      'samples/src/collections/iset/is-empty-example.mts',
      'samples/src/collections/iset/has-example.mts',
      'samples/src/collections/iset/every-example.mts',
      'samples/src/collections/iset/some-example.mts',
      'samples/src/collections/iset/add-example.mts',
      'samples/src/collections/iset/delete-example.mts',
      'samples/src/collections/iset/with-mutations-example.mts',
      'samples/src/collections/iset/map-example.mts',
      'samples/src/collections/iset/filter-example.mts',
      'samples/src/collections/iset/filter-not-example.mts',
      'samples/src/collections/iset/is-subset-of-example.mts',
      'samples/src/collections/iset/is-superset-of-example.mts',
      'samples/src/collections/iset/subtract-example.mts',
      'samples/src/collections/iset/intersect-example.mts',
      'samples/src/collections/iset/union-example.mts',
      'samples/src/collections/iset/for-each-example.mts',
      'samples/src/collections/iset/keys-example.mts',
      'samples/src/collections/iset/values-example.mts',
      'samples/src/collections/iset/entries-example.mts',
      'samples/src/collections/iset/to-array-example.mts',
      'samples/src/collections/iset/to-raw-set-example.mts',
      'samples/src/collections/iset/create-example.mts',
      'samples/src/collections/iset/equal-example.mts',
      'samples/src/collections/iset/diff-example.mts',
      'samples/src/collections/iset/intersection-function-example.mts',
      'samples/src/collections/iset/union-function-example.mts',
      'samples/src/collections/iset/iterator-example.mts',
    ],
  },
  {
    sourcePath: 'src/collections/queue.mts',
    sampleFiles: [
      'samples/src/collections/queue/create-queue-example.mts',
      'samples/src/collections/queue/create-queue-example.mts',
      'samples/src/collections/queue/create-queue-example.mts',
      'samples/src/collections/queue/create-queue-example.mts',
      'samples/src/collections/queue/create-queue-example.mts',
    ],
  },
  {
    sourcePath: 'src/collections/stack.mts',
    sampleFiles: [
      'samples/src/collections/stack/create-stack-example.mts',
      'samples/src/collections/stack/create-stack-example.mts',
      'samples/src/collections/stack/create-stack-example.mts',
      'samples/src/collections/stack/create-stack-example.mts',
      'samples/src/collections/stack/create-stack-example.mts',
    ],
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
    sourcePath: 'src/guard/has-key.mts',
    sampleFiles: ['samples/src/guard/has-key/has-key-example.mts'],
  },
  {
    sourcePath: 'src/guard/is-non-empty-string.mts',
    sampleFiles: [
      'samples/src/guard/is-non-empty-string/is-non-empty-string-example.mts',
    ],
  },
  {
    sourcePath: 'src/guard/is-non-null-object.mts',
    sampleFiles: [
      'samples/src/guard/is-non-null-object/is-non-null-object-example.mts',
    ],
  },
  {
    sourcePath: 'src/guard/is-primitive.mts',
    sampleFiles: ['samples/src/guard/is-primitive/is-primitive-example.mts'],
  },
  {
    sourcePath: 'src/guard/is-record.mts',
    sampleFiles: ['samples/src/guard/is-record/is-record-example.mts'],
  },
  {
    sourcePath: 'src/guard/is-type.mts',
    sampleFiles: [
      'samples/src/guard/is-type/is-undefined-example.mts',
      'samples/src/guard/is-type/is-not-undefined-example.mts',
      'samples/src/guard/is-type/is-boolean-example.mts',
      'samples/src/guard/is-type/is-not-boolean-example.mts',
      'samples/src/guard/is-type/is-number-example.mts',
      'samples/src/guard/is-type/is-not-number-example.mts',
      'samples/src/guard/is-type/is-bigint-example.mts',
      'samples/src/guard/is-type/is-not-bigint-example.mts',
      'samples/src/guard/is-type/is-string-example.mts',
      'samples/src/guard/is-type/is-not-string-example.mts',
      'samples/src/guard/is-type/is-symbol-example.mts',
      'samples/src/guard/is-type/is-not-symbol-example.mts',
      'samples/src/guard/is-type/is-null-example.mts',
      'samples/src/guard/is-type/is-not-null-example.mts',
      'samples/src/guard/is-type/is-nullish-example.mts',
      'samples/src/guard/is-type/is-non-nullish-example.mts',
    ],
  },
  {
    sourcePath: 'src/guard/key-is-in.mts',
    sampleFiles: ['samples/src/guard/key-is-in/key-is-in-example.mts'],
  },
  {
    sourcePath: 'src/iterator/range.mts',
    sampleFiles: ['samples/src/iterator/range-example.mts'],
  },
  {
    sourcePath: 'src/number/branded-types/int.mts',
    sampleFiles: [
      'samples/src/number/branded-types/int/is-int-example.mts',
      'samples/src/number/branded-types/int/as-int-example.mts',
      'samples/src/number/branded-types/int/is-int-example.mts',
      'samples/src/number/branded-types/int/abs-example.mts',
      'samples/src/number/branded-types/int/min-example.mts',
      'samples/src/number/branded-types/int/max-example.mts',
      'samples/src/number/branded-types/int/random-example.mts',
      'samples/src/number/branded-types/int/pow-example.mts',
      'samples/src/number/branded-types/int/add-example.mts',
      'samples/src/number/branded-types/int/sub-example.mts',
      'samples/src/number/branded-types/int/mul-example.mts',
      'samples/src/number/branded-types/int/div-example.mts',
    ],
  },
  {
    sourcePath: 'src/number/branded-types/positive-int.mts',
    sampleFiles: [
      'samples/src/number/branded-types/positive-int/is-positive-int-example.mts',
      'samples/src/number/branded-types/positive-int/as-positive-int-example.mts',
      'samples/src/number/branded-types/positive-int/is-positive-int-example.mts',
      'samples/src/number/branded-types/positive-int/min-example.mts',
      'samples/src/number/branded-types/positive-int/max-example.mts',
      'samples/src/number/branded-types/positive-int/clamp-example.mts',
      'samples/src/number/branded-types/positive-int/random-example.mts',
      'samples/src/number/branded-types/positive-int/pow-example.mts',
      'samples/src/number/branded-types/positive-int/add-example.mts',
      'samples/src/number/branded-types/positive-int/sub-example.mts',
      'samples/src/number/branded-types/positive-int/mul-example.mts',
      'samples/src/number/branded-types/positive-int/div-example.mts',
    ],
  },
  {
    sourcePath: 'src/number/branded-types/positive-safe-int.mts',
    sampleFiles: [
      'samples/src/number/branded-types/positive-safe-int/is-positive-safe-int-example.mts',
      'samples/src/number/branded-types/positive-safe-int/as-positive-safe-int-example.mts',
      'samples/src/number/branded-types/positive-safe-int/is-positive-safe-int-example.mts',
      'samples/src/number/branded-types/positive-safe-int/min-example.mts',
      'samples/src/number/branded-types/positive-safe-int/max-example.mts',
      'samples/src/number/branded-types/positive-safe-int/clamp-example.mts',
      'samples/src/number/branded-types/positive-safe-int/random-example.mts',
      'samples/src/number/branded-types/positive-safe-int/pow-example.mts',
      'samples/src/number/branded-types/positive-safe-int/add-example.mts',
      'samples/src/number/branded-types/positive-safe-int/sub-example.mts',
      'samples/src/number/branded-types/positive-safe-int/mul-example.mts',
      'samples/src/number/branded-types/positive-safe-int/div-example.mts',
    ],
  },
  {
    sourcePath: 'src/number/branded-types/safe-int.mts',
    sampleFiles: [
      'samples/src/number/branded-types/safe-int/is-safe-int-example.mts',
      'samples/src/number/branded-types/safe-int/as-safe-int-example.mts',
      'samples/src/number/branded-types/safe-int/is-safe-int-example.mts',
      'samples/src/number/branded-types/safe-int/abs-example.mts',
      'samples/src/number/branded-types/safe-int/min-example.mts',
      'samples/src/number/branded-types/safe-int/max-example.mts',
      'samples/src/number/branded-types/safe-int/clamp-example.mts',
      'samples/src/number/branded-types/safe-int/random-example.mts',
      'samples/src/number/branded-types/safe-int/pow-example.mts',
      'samples/src/number/branded-types/safe-int/add-example.mts',
      'samples/src/number/branded-types/safe-int/sub-example.mts',
      'samples/src/number/branded-types/safe-int/mul-example.mts',
      'samples/src/number/branded-types/safe-int/div-example.mts',
    ],
  },
  {
    sourcePath: 'src/number/branded-types/uint.mts',
    sampleFiles: [
      'samples/src/number/branded-types/uint/is-uint-example.mts',
      'samples/src/number/branded-types/uint/as-uint-example.mts',
      'samples/src/number/branded-types/uint/is-uint-example.mts',
      'samples/src/number/branded-types/uint/min-example.mts',
      'samples/src/number/branded-types/uint/max-example.mts',
      'samples/src/number/branded-types/uint/clamp-example.mts',
      'samples/src/number/branded-types/uint/random-example.mts',
      'samples/src/number/branded-types/uint/pow-example.mts',
      'samples/src/number/branded-types/uint/add-example.mts',
      'samples/src/number/branded-types/uint/sub-example.mts',
      'samples/src/number/branded-types/uint/mul-example.mts',
      'samples/src/number/branded-types/uint/div-example.mts',
    ],
  },
  {
    sourcePath: 'src/number/num.mts',
    sampleFiles: [
      'samples/src/number/num-from-example.mts',
      'samples/src/number/num-is-non-zero-example.mts',
      'samples/src/number/num-is-non-negative-example.mts',
      'samples/src/number/num-is-positive-example.mts',
      'samples/src/number/num-is-in-range-example.mts',
      'samples/src/number/num-is-in-range-inclusive-example.mts',
      'samples/src/number/num-is-uint-in-range-example.mts',
      'samples/src/number/num-is-uint-in-range-inclusive-example.mts',
      'samples/src/number/num-clamp-example.mts',
    ],
  },
  {
    sourcePath: 'src/number/refined-number-utils.mts',
    sampleFiles: [
      'samples/src/number/refined-number-utils/operators-for-integer-example.mts',
      'samples/src/number/refined-number-utils/operators-for-float-example.mts',
    ],
  },
  {
    sourcePath: 'src/json/json.mts',
    sampleFiles: [
      'samples/src/json/parse-example.mts',
      'samples/src/json/stringify-example.mts',
      'samples/src/json/stringify-selected-example.mts',
      'samples/src/json/stringify-sorted-key-example.mts',
    ],
  },
  {
    sourcePath: 'src/object/object.mts',
    sampleFiles: [
      'samples/src/object/shallow-eq-example.mts',
      'samples/src/object/pick-example.mts',
      'samples/src/object/omit-example.mts',
      'samples/src/object/from-entries-example.mts',
    ],
  },
  {
    sourcePath: 'src/promise/promise.mts',
    sampleFiles: ['samples/src/promise/create-promise-example.mts'],
  },
  {
    sourcePath: 'src/others/tuple.mts',
    sampleFiles: ['samples/src/others/tp-example.mts'],
  },
] as const;
