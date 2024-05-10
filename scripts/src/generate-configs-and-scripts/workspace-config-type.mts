export type WorkspaceConfig = DeepReadonly<{
  tsType: 'mts' | 'preact' | 'react-emotion' | 'react' | undefined;
  isViteApp: boolean;
  srcDirs: string[];
  typeCheckIncludes: string[];
  gen: {
    typeCheck: boolean;
    build: boolean;
    test: boolean;
    lint: boolean;
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
