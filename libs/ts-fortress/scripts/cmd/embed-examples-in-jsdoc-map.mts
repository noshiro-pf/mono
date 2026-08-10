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
  {
    sourcePath: 'src/other-types/recursion.mts',
    sampleFiles: [
      'samples/src/other-types/recursion/linked-list-example.mts',
      'samples/src/other-types/recursion/tree-node-example.mts',
      'samples/src/other-types/recursion/mutually-recursive-example.mts',
      'samples/src/other-types/recursion/mutually-recursive-explicit-example.mts',
      'samples/src/other-types/recursion/mutually-recursive-with-optional-example.mts',
    ],
  },
  {
    sourcePath: 'src/record/optional.mts',
    sampleFiles: [
      'samples/src/other-types/recursion/mutually-recursive-with-optional-example.mts',
    ],
  },
  {
    sourcePath: 'src/other-types/template-literal.mts',
    sampleFiles: [
      'samples/src/other-types/template-literal/path-string.mts',
      'samples/src/other-types/template-literal/http-url.mts',
      'samples/src/other-types/template-literal/semver.mts',
    ],
  },
] as const;
