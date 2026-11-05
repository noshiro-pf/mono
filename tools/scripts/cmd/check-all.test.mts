import { selectEntries } from './check-all.mjs';

const entries = [
  { command: 'ws:fix:lint:apps', build: 'ws:build:deps' },
  { command: 'ws:check:test:browser', build: 'ws:build:deps', browser: 'true' },
  {
    command: 'z:ci:bundle',
    build: 'ws:build:deps',
    browser: 'true',
    java: 'true',
  },
] as const;

const scripts = {
  'z:ci:bundle':
    'run-s --continue-on-error ws:check:types:non-strict-lib ws:check:test:rules',
} as const;

const needs = { 'ws:check:test:rules': 'Java' } as const;

describe('selectEntries', () => {
  test('an entry that needs a browser or Java is skipped, and says why', () => {
    const selected = selectEntries(entries, { all: false, scripts, needs });

    assert.deepStrictEqual(selected.skipped, [
      'ws:check:test:browser (needs Chromium; run with --all)',
      'ws:check:test:rules, part of z:ci:bundle (needs Java; run with --all)',
    ]);
  });

  test('of a skipped bundle, the parts that need neither still run', () => {
    const selected = selectEntries(entries, { all: false, scripts, needs });

    assert.deepStrictEqual(selected.run, [
      { command: 'ws:fix:lint:apps', build: 'ws:build:deps' },
      { command: 'ws:check:types:non-strict-lib', build: 'ws:build:deps' },
    ]);
  });

  test('`browser: full` needs the full Chromium build', () => {
    const selected = selectEntries(
      [{ command: 'ws:check:e2e:shard-2', build: 'ws:build', browser: 'full' }],
      { all: false, scripts, needs: {} },
    );

    assert.deepStrictEqual(selected.run, []);

    assert.deepStrictEqual(selected.skipped, [
      'ws:check:e2e:shard-2 (needs the full Chromium build; run with --all)',
    ]);
  });

  test('--all runs every entry whole', () => {
    const selected = selectEntries(entries, { all: true, scripts, needs });

    assert.deepStrictEqual(
      selected.run.map(({ command }) => command),
      ['ws:fix:lint:apps', 'ws:check:test:browser', 'z:ci:bundle'],
    );

    assert.deepStrictEqual(selected.skipped, []);
  });

  test('a part the table names that no skipped bundle has is an error', () => {
    assert.throws(
      () =>
        selectEntries(entries, {
          all: false,
          scripts,
          needs: { ...needs, 'ws:check:gone': 'Java' },
        }),
      /ws:check:gone/u,
    );
  });
});
