const { join } = require('node:path');
const { readdirSync, writeFileSync } = require('node:fs');

const thisDir = __dirname;
const stdlibDir = join(thisDir, '../dist');

/**
 * 'lib.d.ts',
 * 'lib.dom.d.ts',
 * 'lib.dom.iterable.d.ts',
 * ...
 */
const stdlibFiles = readdirSync(stdlibDir);

/** @type {string[]} */
const stdlibs = stdlibFiles.map(
  (filename) => `/// <reference path="./dist/${filename}" />`
);

const result = [
  '/* eslint-disable @typescript-eslint/triple-slash-reference */',
  '',
  '/// <reference no-default-lib="true"/>',
  '',
  ...stdlibs,
  '',
].join('\n');

writeFileSync(`${thisDir}/../stdlib.d.ts`, result);
