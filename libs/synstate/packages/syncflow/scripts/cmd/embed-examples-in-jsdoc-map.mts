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
 * 3. Run: pnpm run doc:embed:jsdoc (or pnpm exec tsx scripts/cmd/embed-examples-in-jsdoc.mts)
 *
 * The script will replace each ```ts block sequentially with the corresponding sample code.
 */
export const sourceFileMappings: readonly SourceFileMapping[] = [
  // State management
  {
    sourcePath: 'src/core/create/source.mts',
    sampleFiles: ['samples/src/source-example.mts'],
  },
  {
    sourcePath: 'src/utils/create-state.mts',
    sampleFiles: [
      'samples/src/create-state-example.mts',
      'samples/src/create-boolean-state-example.mts',
    ],
  },
  {
    sourcePath: 'src/utils/create-reducer.mts',
    sampleFiles: ['samples/src/create-reducer-example.mts'],
  },
  {
    sourcePath: 'src/utils/create-event-emitter.mts',
    sampleFiles: [
      'samples/src/create-void-event-emitter-example.mts',
      'samples/src/create-event-emitter-example.mts',
    ],
  },
  // Operators
  {
    sourcePath: 'src/core/operators/filter.mts',
    sampleFiles: ['samples/src/filter-example.mts'],
  },
  {
    sourcePath: 'src/core/operators/scan.mts',
    sampleFiles: ['samples/src/scan-example.mts'],
  },
  {
    sourcePath: 'src/core/operators/debounce-time.mts',
    sampleFiles: ['samples/src/debounce-time-example.mts'],
  },
  {
    sourcePath: 'src/core/operators/with-initial-value.mts',
    sampleFiles: ['samples/src/with-initial-value-example.mts'],
  },
  {
    sourcePath: 'src/core/operators/switch-map.mts',
    sampleFiles: ['samples/src/switch-map-example.mts'],
  },
  {
    sourcePath: 'src/core/operators/skip-if-no-change.mts',
    sampleFiles: ['samples/src/skip-if-no-change-example.mts'],
  },
  {
    sourcePath: 'src/core/operators/take-until.mts',
    sampleFiles: ['samples/src/take-until-example.mts'],
  },
  {
    sourcePath: 'src/core/operators/throttle-time.mts',
    sampleFiles: ['samples/src/throttle-time-example.mts'],
  },
  {
    sourcePath: 'src/core/operators/pairwise.mts',
    sampleFiles: ['samples/src/pairwise-example.mts'],
  },
  {
    sourcePath: 'src/core/operators/map-with-index.mts',
    sampleFiles: ['samples/src/map-with-index-example.mts'],
  },
  {
    sourcePath: 'src/core/operators/merge-map.mts',
    sampleFiles: ['samples/src/merge-map-example.mts'],
  },
  // Combination
  {
    sourcePath: 'src/core/combine/combine.mts',
    sampleFiles: ['samples/src/combine-example.mts'],
  },
  {
    sourcePath: 'src/core/combine/merge.mts',
    sampleFiles: ['samples/src/merge-example.mts'],
  },
  {
    sourcePath: 'src/core/combine/zip.mts',
    sampleFiles: ['samples/src/zip-example.mts'],
  },
  // Creation
  {
    sourcePath: 'src/core/create/from-promise.mts',
    sampleFiles: ['samples/src/from-promise-example.mts'],
  },
  {
    sourcePath: 'src/core/create/of.mts',
    sampleFiles: ['samples/src/of-example.mts'],
  },
  {
    sourcePath: 'src/core/create/from-array.mts',
    sampleFiles: ['samples/src/from-array-example.mts'],
  },
  {
    sourcePath: 'src/core/create/interval.mts',
    sampleFiles: ['samples/src/interval-example.mts'],
  },
  {
    sourcePath: 'src/core/create/timer.mts',
    sampleFiles: ['samples/src/timer-example.mts'],
  },
] as const;
