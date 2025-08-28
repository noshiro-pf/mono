import glob_ from 'fast-glob';
import * as fs_ from 'node:fs/promises';
import * as path_ from 'node:path';
import { $ } from './functions/exec-async.mjs';

const globalsDef = {
    $: $,
    echo: console.log,
    path: path_,
    fs: fs_,
    glob: glob_,
};
// eslint-disable-next-line functional/immutable-data
Object.assign(globalThis, globalsDef);
//# sourceMappingURL=node-global.mjs.map
