import { forEachPackages } from '../esm/index.mjs';
import { wsrunStagesOptions } from './constants.mjs';

forEachPackages({
  prefixes: ['packages/apps'],
  command: 'type-check',
  wsrunOptions: wsrunStagesOptions,
}).catch(console.error);
