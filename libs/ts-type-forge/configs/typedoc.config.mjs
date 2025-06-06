import * as path from 'node:path';

const srcDir = path.resolve(import.meta.dirname, '../src');
const outDir = path.resolve(import.meta.dirname, '../docs');

/** @type { Partial<import("typedoc").TypeDocOptions & import("typedoc-plugin-markdown").PluginOptions>} */
const config = {
  plugin: ['typedoc-plugin-markdown'],
  router: 'module',
  entryPoints: [`${srcDir}/**/*.d.mts`],
  exclude: ['./tuple-and-list/tuple.d.mts', './index.d.mts'].map((p) =>
    path.resolve(srcDir, p),
  ),
  out: outDir,
  gitRevision: 'main',
  excludeInternal: true,
  mergeReadme: true,
  sort: ['source-order'],
};

export default config;
