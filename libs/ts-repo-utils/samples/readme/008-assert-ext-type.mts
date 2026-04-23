type CheckExtConfig = Readonly<{
  directories: readonly Readonly<{
    path: string; // Directory path to check
    extension: string; // Expected file extension (including the dot)
    ignorePatterns?: readonly string[]; // Optional glob patterns to ignore
  }>[];
}>;

// embed-sample-code-ignore-below
export type { CheckExtConfig };
