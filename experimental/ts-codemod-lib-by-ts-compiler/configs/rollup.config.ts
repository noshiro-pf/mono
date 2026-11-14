/* eslint-disable import/no-default-export */
/* eslint-disable import/no-internal-modules */

import { defineRollupConfig } from '@noshiro/mono-configs/define-rollup-config';
import { toThisDir } from '@noshiro/mono-utils';
import tsconfig from './tsconfig.build.json' with { type: 'json' };

export default defineRollupConfig({
  configDir: toThisDir(import.meta.url),
  outDirRelative: tsconfig.compilerOptions.outDir,
  variablesToDrop: ['console.debug'],
});
