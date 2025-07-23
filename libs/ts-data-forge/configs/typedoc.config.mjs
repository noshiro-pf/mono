import * as path from 'node:path';

const srcDir = path.resolve(import.meta.dirname, '../src');
const outDir = path.resolve(import.meta.dirname, '../docs');
const externalDocumentsDir = path.resolve(import.meta.dirname, '../documents');

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
  projectDocuments: [`${externalDocumentsDir}/*.md`],
};

export default config;
