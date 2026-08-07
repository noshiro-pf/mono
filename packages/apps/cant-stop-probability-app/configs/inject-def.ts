/* eslint-disable @typescript-eslint/no-restricted-imports */

import { genGlobalImportDefsFromDevDependencies } from '@noshiro/mono-utils';
import { castDeepMutable, tp } from '@noshiro/ts-utils';
import inject from '@rollup/plugin-inject';
import { type PluginOption } from 'vite';
import packageJson from '../package.json' with { type: 'json' };

export const createInjectDef = async (): Promise<PluginOption> => {
  const injectionRules = await genGlobalImportDefsFromDevDependencies(
    packageJson.devDependencies,
    // Resolve the @noshiro/global-* packages from this package, which is
    // where they are declared as dependencies.
    // eslint-disable-next-line import/dynamic-import-chunkname
    async (specifier) => import(specifier),
  );

  return inject({
    modules: castDeepMutable({
      ...injectionRules,
      dict: tp('~/constants/dictionary/dictionary', 'dict'),
    }),
    include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.mdx'] as const,
  }) as PluginOption;
};
