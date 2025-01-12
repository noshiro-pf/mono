/* eslint-disable import/no-default-export */
/* eslint-disable import/no-internal-modules */

import { toThisDir } from '@noshiro/node-utils';
import { defineRollupConfig } from '../../../../configs/define-rollup-config.mjs';
import tsconfig from './tsconfig.build.json' assert { type: 'json' };

export default defineRollupConfig({
  configDir: toThisDir(import.meta.url),
  outDirRelative: tsconfig.compilerOptions.outDir,
});
