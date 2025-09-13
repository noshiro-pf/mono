type GenIndexConfig = Readonly<{
  /** Target directories to generate index files for (string or array of strings) */
  targetDirectory: string | readonly string[];

  /**
   * Glob patterns for files or predicate function to exclude from exports
   * (default: excludes `'**\/*.{test,spec}.?(c|m)[jt]s?(x)'` and
   * `'**\/*.d.?(c|m)ts'`)
   */
  exclude?:
    | readonly string[]
    | ((
        args: Readonly<{
          absolutePath: string;
          relativePath: string;
          fileName: string;
        }>,
      ) => boolean);

  /**
   * File extensions of source files to include in exports (default: ['.ts',
   * '.tsx'])
   */
  targetExtensions?: readonly `.${string}`[];

  /** File extension of index files to generate (default: '.ts') */
  indexFileExtension?: `.${string}`;

  /** File extension to use in export statements (default: '.js') */
  exportStatementExtension?: `.${string}` | 'none';

  /** Command to run for formatting generated files (optional) */
  formatCommand?: string;

  /** Whether to suppress output during execution (default: false) */
  silent?: boolean;
}>;

// embed-sample-code-ignore
export type { GenIndexConfig };
