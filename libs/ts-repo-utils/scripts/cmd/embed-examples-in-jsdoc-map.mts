type SourceFileMapping = Readonly<{
  sourcePath: string;
  sampleFiles: readonly string[];
}>;

/**
 * Mapping from source files to their sample code files. Sample files must be
 * listed in the order their `@example` blocks appear in the source file (top
 * to bottom).
 *
 * Run `pnpm run doc:embed:jsdoc` after editing this, and see
 * `tools/scripts/cmd/check-example-coverage.mts` for the check that every
 * `@example` under `src/` is listed here.
 */
export const sourceFileMappings: readonly SourceFileMapping[] = [
  {
    sourcePath: 'src/functions/should-run.mts',
    sampleFiles: [
      'samples/src/check-should-run-example.mts',
      'samples/src/check-should-run-type-checks-example.mts',
    ],
  },
] as const;
