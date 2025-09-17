/* eslint-disable import/no-internal-modules */
import glob_ from 'fast-glob';
import * as fs_ from 'node:fs/promises';
import * as os_ from 'node:os';
import * as path_ from 'node:path';
import { Result as Result_ } from 'ts-data-forge';
import { $ as $_ } from './functions/exec-async.mjs';
import { isDirectlyExecuted as isDirectlyExecuted_ } from './functions/is-directly-executed.mjs';

const globalsDef = {
  // eslint-disable-next-line tree-shakable/import-star
  path: path_,
  // eslint-disable-next-line tree-shakable/import-star
  fs: fs_,
  // eslint-disable-next-line tree-shakable/import-star
  os: os_,
  glob: glob_,

  $: $_,
  Result: Result_,
  echo: console.log,
  isDirectlyExecuted: isDirectlyExecuted_,
} as const;

// eslint-disable-next-line functional/immutable-data
Object.assign(globalThis, globalsDef);

declare global {
  const path: typeof path_;
  const fs: typeof fs_;
  const os: typeof os_;
  const glob: typeof glob_;

  const $: typeof $_;
  const Result: typeof Result_;
  type Result<S, E> = Result_<S, E>;
  const echo: typeof console.log;
  const isDirectlyExecuted: typeof isDirectlyExecuted_;
}
