import * as path from 'node:path';

const srcDir = path.resolve(import.meta.dirname, '../src');

const outDir = path.resolve(import.meta.dirname, '../docs');

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  plugin: ['typedoc-github-theme'],
  // The package's own `tsconfig.json` also covers `test/`, `scripts/` and
  // `configs/`, and TypeDoc reports that whole program's type errors even
  // though it documents `src/` alone. That matters here because TypeDoc runs
  // on `typescript`, whose lib replacement ignores `paths` and so never finds
  // the strict standard library — `test/strict-lib-active.mts` asserts the
  // opposite and fails under it. The build config covers exactly what is
  // documented.
  tsconfig: path.resolve(import.meta.dirname, './tsconfig.build.json'),
  entryPoints: [`${srcDir}/**/*.mts`],
  exclude: ['./**/index.mts', './**/*.test.mts', './entry-point.mts'].map((p) =>
    path.resolve(srcDir, p),
  ),
  out: outDir,
  gitRevision: 'main',
  headings: {
    document: true,
    readme: false,
  },
  excludeInternal: true,
};

export default config;
