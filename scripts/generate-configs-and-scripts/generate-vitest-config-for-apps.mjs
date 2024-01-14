import path from 'node:path';
import { workspaceConfigsDirName } from './constants.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

/**
 * @param {string} workspaceLocation
 * @param {string} packageName
 */
export const generateVitestConfigForApps = async (
  workspaceLocation,
  packageName,
) => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!(cfg.gen.test || cfg.gen.build)) return;

  const content = [
    `import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';`,
    `import * as nodePath from 'node:path';`,
    `import { defineConfig } from 'vitest/config';`,
    `import { createInjectDef } from './inject-def';`,
    ``,
    `const thisDir: string = toThisDir(import.meta.url);`,
    ``,
    `export default defineConfig(async () => {`,
    `  const injectDef = await createInjectDef();`,
    ``,
    `  return {`,
    `    plugins: [injectDef],`,
    `    test: {`,
    `      globals: true,`,
    `      environment: 'happy-dom',`,
    `      typecheck: {`,
    `        tsconfig: nodePath.resolve(thisDir, 'tsconfig.test.json'),`,
    `      },`,
    `    },`,
    `  };`,
    `});`,
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    'vitest.config.ts',
    content,
    packageName,
  );
};
