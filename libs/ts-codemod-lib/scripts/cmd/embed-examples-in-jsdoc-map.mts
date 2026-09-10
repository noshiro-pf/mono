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
    sourcePath:
      'src/functions/ast-transformers/enable-no-unchecked-indexed-access.mts',
    sampleFiles: [
      'samples/src/enable-no-unchecked-indexed-access-jsdoc-example.mts',
    ],
  },
  {
    sourcePath: 'src/functions/functions/wrap-with-parentheses.mts',
    sampleFiles: ['samples/src/wrap-with-parentheses-example.mts'],
  },
] as const;
