import { forEachPackages } from '../esm/index.mjs';
import { pnpmStagesOptions } from './constants.mjs';

forEachPackages({
  prefixes: ['packages/apps'],
  command: 'build',
  pnpmOptions: pnpmStagesOptions,
}).catch(console.error);
