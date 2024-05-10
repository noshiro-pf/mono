import path from 'node:path';
import { toPositiveSafeInt, zeros } from '../ts-utils/index.mjs';
import {
  tsconfigBuildJsonName,
  workspaceConfigsDirName,
} from './constants.mjs';
import { toTestTargetGlob } from './to-test-target-glob.mjs';
import { tsConfigExtendString } from './ts-config-extend-string.mjs';
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

  const depth = toPositiveSafeInt(workspaceLocation.split('/').length + 1);

  const pathPrefixToRoot = zeros(depth)
    .map(() => '..')
    .join('/');

  const content = [
    `{`,
    ...tsConfigExtendString(
      cfg.tsType,
      pathPrefixToRoot,
      'tsconfig.lib.build.json',
      cfg.isViteApp,
    ),
    ',',
    `  "compilerOptions": {`,
    `    "outDir": "../esm"`,
    `  },`,
    `  "include": ["../src"],`,
    `  "exclude": ["../${toTestTargetGlob(cfg)}"]`,
    `}`,
    '',
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    tsconfigBuildJsonName,
    content,
    packageName,
  );
};
