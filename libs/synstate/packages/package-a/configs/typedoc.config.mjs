import * as path from 'node:path';

const srcDir = path.resolve(import.meta.dirname, '../src');

const outDir = path.resolve(import.meta.dirname, '../docs');

/** @type { Partial<import("typedoc").TypeDocOptions & import("typedoc-plugin-markdown").PluginOptions>} */
const config = {
  plugin: ['typedoc-plugin-markdown'],
  router: 'module',
  entryPoints: [`${srcDir}/**/*.mts`],
  exclude: ['./index.mts', './**/*.test.mts'].map((p) =>
    path.resolve(srcDir, p),
  ),
  out: outDir,
  gitRevision: 'main',
  excludeInternal: true,
  mergeReadme: true,
};

export default config;
