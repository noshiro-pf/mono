type CheckExtConfig = Readonly<{
  directories: readonly Readonly<{
    path: string; // Directory path to check
    extension: `.${string}` | readonly `.${string}`[]; // Expected file extension(s) (including the dot)
    ignorePatterns?: readonly string[]; // Optional glob patterns to ignore (default: ['tsconfig.json'])
  }>[];
}>;

// embed-sample-code-ignore-below
export type { CheckExtConfig };
