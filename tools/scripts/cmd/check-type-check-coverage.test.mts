import { findUncoveredFiles } from './check-type-check-coverage.mjs';

describe(findUncoveredFiles, () => {
  test('reports a code file no config names', () => {
    assert.deepStrictEqual(
      findUncoveredFiles(
        ['oxlint.config.mts', 'tools/a.mts', 'README.md'],
        new Set<string>(['tools/a.mts']),
        [],
      ),
      { uncovered: ['oxlint.config.mts'], staleExemptions: [] },
    );
  });

  test('accepts a file a config names', () => {
    assert.deepStrictEqual(
      findUncoveredFiles(
        ['apps/a/astro.config.mjs'],
        new Set<string>(['apps/a/astro.config.mjs']),
        [],
      ),
      { uncovered: [], staleExemptions: [] },
    );
  });

  test('checks every code extension and nothing else', () => {
    assert.deepStrictEqual(
      findUncoveredFiles(
        [
          'a.cjs',
          'a.cts',
          'a.d.mts',
          'a.js',
          'a.json',
          'a.jsx',
          'a.md',
          'a.mjs',
          'a.mts',
          'a.ts',
          'a.tsx',
        ],
        new Set<string>(),
        [],
      ).uncovered,
      [
        'a.cjs',
        'a.cts',
        'a.d.mts',
        'a.js',
        'a.jsx',
        'a.mjs',
        'a.mts',
        'a.ts',
        'a.tsx',
      ],
    );
  });

  test('ignores experimental/ and docs/', () => {
    assert.deepStrictEqual(
      findUncoveredFiles(
        ['experimental/old/index.ts', 'docs/reveal-slides/main.js'],
        new Set<string>(),
        [],
      ),
      { uncovered: [], staleExemptions: [] },
    );
  });

  test('honours an exemption, with `*` matching within one segment', () => {
    assert.deepStrictEqual(
      findUncoveredFiles(
        [
          'strict-lib/v5.0/output/lib/a.d.ts',
          'strict-lib/v7.0/output/lib/b.d.ts',
          'strict-lib/v7.0/nested/output/c.d.ts',
          'strict-lib/v7.0/outputs/d.d.ts',
        ],
        new Set<string>(),
        [{ pattern: 'strict-lib/v*/output/**', reason: '' }],
      ),
      {
        uncovered: [
          'strict-lib/v7.0/nested/output/c.d.ts',
          'strict-lib/v7.0/outputs/d.d.ts',
        ],
        staleExemptions: [],
      },
    );
  });

  test('fails an exemption that exempts no file', () => {
    assert.deepStrictEqual(
      findUncoveredFiles(
        ['apps/a/scripts/run.mjs', 'apps/a/src/content.config.ts'],
        new Set<string>(['apps/a/src/content.config.ts']),
        [
          { pattern: 'apps/a/scripts/run.mjs', reason: '' },
          { pattern: 'apps/a/src/content.config.ts', reason: '' },
          { pattern: 'verify-npm-packages/smoke/**', reason: '' },
        ],
      ),
      {
        uncovered: [],
        staleExemptions: [
          'apps/a/src/content.config.ts',
          'verify-npm-packages/smoke/**',
        ],
      },
    );
  });
});
