import { forEachPackages } from '../esm/index.mjs';
import { pnpmStagesOptions } from './constants.mjs';

forEachPackages({
  prefixes: ['packages/apps'],
  command: 'type-check',
  pnpmOptions: pnpmStagesOptions,
}).catch(console.error);
