import { default as glob_ } from 'fast-glob';
import * as fs_ from 'node:fs/promises';
import * as path_ from 'node:path';
import { $ as $_, projectRootPath as projectRootPath_ } from './utils.mjs';

const globalsDef = {
  $: $_,
  echo: console.log,
  projectRootPath: projectRootPath_,

  path: path_,
  fs: fs_,
  glob: glob_,
} as const;

Object.assign(globalThis, globalsDef);

declare global {
  const $: typeof $_;
  const echo: typeof console.log;
  const projectRootPath: typeof projectRootPath_;

  const path: typeof path_;
  const fs: typeof fs_;
  const glob: typeof glob_;
}
