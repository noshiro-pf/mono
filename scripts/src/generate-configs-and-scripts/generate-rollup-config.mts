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

  const content = [
    '/* eslint-disable import/no-default-export */',
    '/* eslint-disable import/no-internal-modules */',
    '',
    "import { defineRollupConfig } from '@noshiro/mono-configs/define-rollup-config';",
    `import tsconfig from './${tsconfigBuildJsonName}' with { type: 'json' };`,
    '',
    'export default defineRollupConfig({',
    '  configDir: import.meta.dirname,',
    '  outDirRelative: tsconfig.compilerOptions.outDir,',
    cfg.rollupConfig?.variablesToDrop !== undefined
      ? `  variablesToDrop: ${JSON.stringify(cfg.rollupConfig.variablesToDrop)},`
      : '',
    '});',
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    rollupConfigName,
    content,
    packageName,
  );
};
