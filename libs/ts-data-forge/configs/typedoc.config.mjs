import * as path from 'node:path';

const srcDir = path.resolve(import.meta.dirname, '../src');
const outDir = path.resolve(import.meta.dirname, '../docs');

const readmePlugin = path.resolve(
  import.meta.dirname,
  './typedoc-readme-plugin.mjs',
);

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  plugin: ['typedoc-github-theme', readmePlugin],
  entryPoints: [`${srcDir}/**/*.mts`],
  exclude: [
    './**/index.mts',
    './**/*.test.mts',
    './entry-point.mts',
    './globals.d.mts',
  ].map((p) => path.resolve(srcDir, p)),
  out: outDir,
  gitRevision: 'main',
  excludeInternal: true,
};

export default config;
