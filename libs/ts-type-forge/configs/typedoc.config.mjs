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
    './**/_internals.mts',
    './**/_number-brand-internals.mts',
    './entry-point.mts',
    './global.mts',
  ].map((p) => path.resolve(srcDir, p)),
  out: outDir,
  gitRevision: 'main',
  // Pin the source link template instead of relying on git-remote
  // auto-detection, so `pnpm doc` produces identical output regardless of the
  // local git remote configuration (e.g. proxied clones that rewrite the
  // GitHub remote URL). This matches the URL TypeDoc derives from the GitHub
  // origin in CI.
  sourceLinkTemplate:
    'https://github.com/noshiro-pf/mono/blob/{gitRevision}/{path}#L{line}',
  headings: {
    document: true,
    readme: false,
  },
  excludeInternal: true,
};

export default config;
