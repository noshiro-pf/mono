import 'zx/globals';
import {
  rollupConfigName,
  tsconfigBuildJsonName,
  workspaceConfigsDirName,
} from './constants.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generateRollupConfigForUtils = async (
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

  const content = [
    '/* eslint-disable import/no-default-export */',
    '/* eslint-disable import/no-internal-modules */',
    '',
    "import { toThisDir } from '@noshiro/mono-utils';",
    `import { defineRollupConfig } from '${pathPrefixToRoot}/configs/define-rollup-config.mjs';`,
    `import tsconfig from './${tsconfigBuildJsonName}' with { type: 'json' };`,
    '',
    'export default defineRollupConfig({',
    '  configDir: toThisDir(import.meta.url),',
    '  outDirRelative: tsconfig.compilerOptions.outDir,',
    '});',
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    rollupConfigName,
    content,
    packageName,
  );
};
