import path from 'node:path';
import {
  tsconfigBuildJsonName,
  workspaceConfigsDirName,
} from './constants.mjs';
import { toTestTargetGlob } from './to-test-target-glob.mjs';
import { tsConfigExtend } from './ts-config-extend-string.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generateTsConfigForBuild = async (
  workspaceLocation: string,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!cfg.gen.build) return;

  const depth = workspaceLocation.split('/').length + 1;

  const pathPrefixToRoot = Array.from({ length: depth }, () => '..').join('/');

  const content = JSON.stringify(
    {
      extends: tsConfigExtend(
        cfg.tsType,
        pathPrefixToRoot,
        'tsconfig.lib.build.json',
        cfg.useVite,
      ),
      compilerOptions: cfg.tsconfig?.compilerOptions ?? {
        outDir: '../esm',
      },
      include: ['../src'],
      exclude: toTestTargetGlob(cfg).map((s) => `../${s}`),
    },
    undefined,
    2,
  );

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    tsconfigBuildJsonName,
    content,
    packageName,
  );
};
