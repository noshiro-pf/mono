import path from 'node:path';
import { workspaceConfigsDirName } from './constants.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generateInjectDef = async (
  workspaceLocation: string,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!(cfg.gen.test || cfg.gen.build)) return;

  const content = [
    '/* eslint-disable @typescript-eslint/explicit-function-return-type */',
    '/* eslint-disable @typescript-eslint/no-restricted-imports */',
    '',

    `import { genGlobalImportDefsFromDevDependencies } from '@noshiro/mono-scripts';`,
    `import { castDeepMutable, tp } from '@noshiro/ts-utils';`,
    `import inject from '@rollup/plugin-inject';`,
    `import { type PluginOption } from 'vite';`,
    `import packageJson from '../package.json' assert { type: 'json' };`,
    ``,
    `export const createInjectDef = async () => {`,
    `  const injectionRules = await genGlobalImportDefsFromDevDependencies(`,
    `    packageJson.devDependencies,`,
    `  );`,
    ``,
    '  // eslint-disable-next-line no-restricted-syntax',
    `  return inject({`,
    `    modules: castDeepMutable({`,
    `      ...injectionRules,`,
    `      dict: tp('~/constants/dictionary/dictionary', 'dict'),`,
    `    }),`,
    `    include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.mdx'] as const,`,
    `  }) as PluginOption;`,
    `};`,
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    'inject-def.ts',
    content,
    packageName,
  );
};
