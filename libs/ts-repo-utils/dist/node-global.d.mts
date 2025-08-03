import { default as glob_ } from 'fast-glob';
import * as fs_ from 'node:fs/promises';
import * as path_ from 'node:path';
import { $ as $_ } from './functions/exec-async.mjs';
declare global {
    const $: typeof $_;
    const echo: typeof console.log;
    const path: typeof path_;
    const fs: typeof fs_;
    const glob: typeof glob_;
}
//# sourceMappingURL=node-global.d.mts.map