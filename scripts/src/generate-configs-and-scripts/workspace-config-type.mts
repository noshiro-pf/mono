export type WorkspaceConfig = DeepReadonly<{
  tsType: 'dom' | 'mts' | 'preact' | 'react-emotion' | 'react' | undefined;
  useVite: boolean | 'vitest-only';
  srcDirs: string[];
  typeCheckIncludes: string[];
  gen: {
    typeCheck: boolean;
    build: boolean;
    test: boolean;
    lint: boolean;
  };
  tsconfig?: {
    compilerOptions: RecordBase;
  };
  packageJson: {
    scripts: {
      gi: 0 | 1 | 2 | 3 | false;
      giIgnore?: string[];
      publish: boolean;
      passWithNoTests?: true;
      lint?: false;
    };
  };
}>;
