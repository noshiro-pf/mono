import { forEachPackages } from '../esm/index.mjs';
import { pnpmStagesOptions, utilsDirs } from './constants.mjs';

forEachPackages({
  prefixes: utilsDirs,
  command: 'build',
  pnpmOptions: pnpmStagesOptions,
}).catch(console.error);
