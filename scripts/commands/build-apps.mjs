import { forEachPackages } from '../esm/index.mjs';
import { wsrunStagesOptions } from './constants.mjs';

forEachPackages({
  prefixes: ['packages/apps'],
  command: 'build',
  wsrunOptions: wsrunStagesOptions,
}).catch(console.error);
