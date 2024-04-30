import path from 'node:path';
import { workspaceConfigsDirName } from './constants.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generateVitestConfigForUtils = async (
  workspaceLocation: string,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!(cfg.gen.test || cfg.gen.build)) return;

  const content = [
    "import { toThisDir } from '@noshiro/mono-scripts';",
    "import * as nodePath from 'node:path';",
    "import { defineConfig } from 'vitest/config';",
    '',
    'const thisDir: string = toThisDir(import.meta.url);',
    '',
    'export default defineConfig({',
    '  test: {',
    '    globals: true,',
    '    typecheck: {',
    "      tsconfig: nodePath.resolve(thisDir, 'tsconfig.test.json'),",
    '    },',
    cfg.packageJson.scripts.passWithNoTests ? '    passWithNoTests: true,' : '',
    '  },',
    '});',
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    'vitest.config.ts',
    content,
    packageName,
  );
};
