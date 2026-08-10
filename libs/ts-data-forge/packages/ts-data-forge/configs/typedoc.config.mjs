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
  // Build source links from an explicit template so they are deterministic
  // regardless of the environment's git remote (which may not resolve to
  // github.com, e.g. in sandboxes/CI mirrors). `{path}` is resolved relative
  // to the repository root, so it includes the `packages/ts-data-forge/`
  // prefix in this monorepo.
  sourceLinkTemplate:
    'https://github.com/noshiro-pf/ts-data-forge/blob/{gitRevision}/{path}#L{line}',
  headings: {
    document: true,
    readme: false,
  },
  excludeInternal: true,
};

export default config;
