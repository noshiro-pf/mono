type SourceFileMapping = Readonly<{
  sourcePath: string;
  sampleFiles: readonly string[];
}>;

/**
 * Mapping from source files to their sample code files, listed in the order
 * their `@example` blocks appear in the source file. Run `pnpm run gen:jsdoc`
 * after changing a sample.
 */
export const sourceFileMappings: readonly SourceFileMapping[] = [
  {
    sourcePath: 'src/href.mts',
    sampleFiles: ['samples/src/external-href-example.mts'],
  },
  {
    sourcePath: 'src/param-codec.mts',
    sampleFiles: ['samples/src/param-example.mts'],
  },
  {
    sourcePath: 'src/search-codec.mts',
    sampleFiles: ['samples/src/search-example.mts'],
  },
  {
    sourcePath: 'src/define-routes.mts',
    sampleFiles: [
      'samples/src/define-routes-example.mts',
      'samples/src/match-routes-example.mts',
    ],
  },
  {
    sourcePath: 'src/browser.mts',
    sampleFiles: ['samples/src/memory-browser-example.mts'],
  },
  {
    sourcePath: 'src/create-router.mts',
    sampleFiles: ['samples/src/create-router-example.mts'],
  },
  {
    sourcePath: 'src/match-at.mts',
    sampleFiles: ['samples/src/match-at-example.mts'],
  },
  {
    sourcePath: 'src/href-with-search.mts',
    sampleFiles: ['samples/src/href-with-search-example.mts'],
  },
  {
    sourcePath: 'src/page-values.mts',
    sampleFiles: ['samples/src/page-values-example.mts'],
  },
  {
    sourcePath: 'src/link-click.mts',
    sampleFiles: ['samples/src/link-click-example.mts'],
  },
] as const;
