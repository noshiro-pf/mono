type SourceFileMapping = Readonly<{
  sourcePath: string;
  sampleFiles: readonly string[];
}>;

/**
 * Mapping from source files to their sample code files, listed in the order
 * their `@example` blocks appear in the source file. Run `pnpm run gen:jsdoc`
 * after changing a sample.
 */
export const sourceFileMappings: readonly SourceFileMapping[] = [] as const;
