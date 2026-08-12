// eslint-disable-next-line import-x/no-relative-packages
import { defineLibraryRollupConfig } from '../../../tools/configs/rollup-config.mjs';
import tsconfig from './tsconfig.build.json' with { type: 'json' };

export default await defineLibraryRollupConfig({
  configDir: import.meta.dirname,
  outDir: tsconfig.compilerOptions.outDir,
});
