/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-restricted-imports */
/* eslint-disable import/no-internal-modules */

import { genGlobalImportDefsFromDevDependencies } from '@noshiro/mono-scripts';
import { castDeepMutable, tp } from '@noshiro/ts-utils';
import inject from '@rollup/plugin-inject';
import packageJson from '../package.json' assert { type: 'json' };

export const createInjectDef = async () => {
  const injectionRules = await genGlobalImportDefsFromDevDependencies(
    packageJson.devDependencies,
  );

  return inject({
    modules: castDeepMutable({
      ...injectionRules,
      dict: tp('~/constants/dictionary/dictionary', 'dict'),
    }),
    include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.mdx'] as const,
  });
};
