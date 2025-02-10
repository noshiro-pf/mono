import 'zx/globals';
import { tsconfigTestJsonName, workspaceConfigsDirName } from './constants.mjs';
import { tsConfigExtend } from './ts-config-extend-string.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generateTsConfigForTest = async (
  workspaceLocation: string,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!cfg.gen.test) return;

  const depth = workspaceLocation.split('/').length + 1;

  const pathPrefixToRoot = Array.from({ length: depth }, () => '..').join('/');

  const content = JSON.stringify(
    {
      extends: tsConfigExtend(
        cfg.tsType,
        pathPrefixToRoot,
        tsconfigTestJsonName,
        cfg.useVite,
      ),
      compilerOptions: cfg.tsconfig?.compilerOptions,
      include: cfg.srcDirs.map((d) => `../${d}`),
    },
    undefined,
    2,
  );

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    tsconfigTestJsonName,
    content,
    packageName,
  );
};
