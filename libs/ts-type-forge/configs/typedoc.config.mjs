import * as path from 'node:path';

const srcDir = path.resolve(import.meta.dirname, '../src');

const outDir = path.resolve(import.meta.dirname, '../docs');

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  plugin: ['typedoc-github-theme'],
  entryPoints: [`${srcDir}/**/*.mts`],
  exclude: [
    './**/index.mts',
    './**/*.test.mts',
    './entry-point.mts',
    './globals.d.mts',
  ].map((p) => path.resolve(srcDir, p)),
  out: outDir,
  gitRevision: 'main',
  headings: {
    document: true,
    readme: false,
  },
  excludeInternal: true,
};

export default config;
