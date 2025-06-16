import { default as glob_ } from 'fast-glob';
import * as fs_ from 'node:fs/promises';
import * as path_ from 'node:path';
import { $ as $_ } from './functions/exec-async.mjs';

const globalsDef = {
  $: $_,
  echo: console.log,

  path: path_,
  fs: fs_,
  glob: glob_,
} as const;

Object.assign(globalThis, globalsDef);

declare global {
  const $: typeof $_;
  const echo: typeof console.log;

  const path: typeof path_;
  const fs: typeof fs_;
  const glob: typeof glob_;
}
