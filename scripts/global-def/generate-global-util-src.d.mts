export type TypeImports = Readonly<{ name: string; params: readonly string[] }>;
export type Imports = Readonly<{ default: string }> | string;

export declare const generateAllGlobalDefs: ({
  rootDir,
  packageName,
  importsList,
  typeImportsList,
}: Readonly<{
  rootDir: string;
  packageName: string;
  importsList: readonly Imports[];
  typeImportsList: readonly TypeImports[];
}>) => Promise<void>;
