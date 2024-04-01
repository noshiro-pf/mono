/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-restricted-imports */
/* eslint-disable import/no-internal-modules */

import { genGlobalImportDefsFromDevDependencies } from '@noshiro/mono-scripts/global-def/get-global-import-def-from-dev-dependencies.mjs';
import { castDeepWritable, tp } from '@noshiro/ts-utils';
import inject from '@rollup/plugin-inject';
import packageJson from '../package.json' assert { type: 'json' };

export const createInjectDef = async () => {
  const injectionRules = await genGlobalImportDefsFromDevDependencies(
    packageJson.devDependencies,
  );

  return inject({
    modules: castDeepWritable({
      ...injectionRules,
      dict: tp('~/constants/dictionary/dictionary', 'dict'),
    }),
    include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.mdx'] as const,
  });
};
