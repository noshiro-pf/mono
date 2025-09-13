/* eslint-disable import/no-internal-modules */
import { default as glob_ } from 'fast-glob';
import * as fs_ from 'node:fs/promises';
import * as path_ from 'node:path';
import { $ as $_ } from './functions/exec-async.mjs';
import { isDirectlyExecuted as isDirectlyExecuted_ } from './functions/is-directly-executed.mjs';

const globalsDef = {
  $: $_,
  echo: console.log,

  path: path_,
  fs: fs_,
  glob: glob_,
  isDirectlyExecuted: isDirectlyExecuted_,
} as const;

// eslint-disable-next-line functional/immutable-data
Object.assign(globalThis, globalsDef);

declare global {
  const $: typeof $_;
  const echo: typeof console.log;

  const path: typeof path_;
  const fs: typeof fs_;
  const glob: typeof glob_;
  // const isDirectlyExecuted: typeof isDirectlyExecuted_;
}
