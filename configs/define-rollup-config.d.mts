export declare const defineRollupConfig: ({
  configDir,
  outDirRelative,
  variablesToDrop,
}: Readonly<{
  configDir: string;
  outDirRelative: string;
  variablesToDrop?: readonly string[];
}>) => {
  readonly input: string[];
  readonly output: {
    readonly format: 'es';
    readonly dir: string;
    readonly preserveModules: true;
    readonly preserveModulesRoot: 'src';
    readonly sourcemap: true;
    readonly entryFileNames: '[name].mjs';
  };
  readonly plugins: [
    import('rollup').Plugin<any>,
    import('rollup').Plugin<any>,
    import('rollup').Plugin<any>,
    import('rollup').Plugin<any>,
  ];
};
