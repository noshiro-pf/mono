/* eslint-disable import/no-default-export */
/* eslint-disable import/no-internal-modules */

import { defineRollupConfig } from '../../../../configs/define-rollup-config.mjs';
import tsconfig from './tsconfig.build.json' with { type: 'json' };

export default defineRollupConfig({
  configDir: import.meta.dirname,
  outDirRelative: tsconfig.compilerOptions.outDir,
});
