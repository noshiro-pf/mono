import { tsConfigExtend } from './ts-config-extend-string.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generateTsConfigForTypeCheck = async (
  workspaceLocation: string,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!cfg.gen.typeCheck) return;

  const depth = workspaceLocation.split('/').length;

  const pathPrefixToRoot = Array.from({ length: depth }, () => '..').join('/');

  const content = JSON.stringify(
    {
      extends: tsConfigExtend(
        cfg.tsType,
        pathPrefixToRoot,
        cfg.useVite === true
          ? 'tsconfig.type-check.json'
          : 'tsconfig.lib.type-check.json',
        cfg.useVite,
      ),
      compilerOptions: cfg.tsconfig?.compilerOptions,
      include: cfg.typeCheckIncludes.map((s) =>
        s.startsWith('./') ? s : `./${s}`,
      ),
    },
    undefined,
    2,
  );

  await writeDirAndFileAndPrintDone(
    workspaceLocation,
    'tsconfig.json',
    content,
    packageName,
  );
};
