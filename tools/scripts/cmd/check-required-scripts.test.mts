// cspell:ignore testw

import { findScriptProblems } from './check-required-scripts.mjs';

const nothing = {
  hasTsconfig: false,
  hasEslintConfig: false,
  hasTests: false,
  hasBrowserTests: false,
} as const;

describe('findScriptProblems', () => {
  test('a member with nothing to check needs no script', () => {
    assert.deepStrictEqual(
      findScriptProblems({ scripts: new Set<string>(), ...nothing }),
      [],
    );
  });

  test('requires check:types, check:lint, fix:lint and check:test by what the member has', () => {
    assert.deepStrictEqual(
      findScriptProblems({
        scripts: new Set<string>(),
        hasTsconfig: true,
        hasEslintConfig: true,
        hasTests: true,
        hasBrowserTests: true,
      }),
      [
        'missing `check:types`',
        'missing `check:lint`',
        'missing `fix:lint`',
        'missing `check:test`',
        'missing `check:test:browser`',
      ],
    );
  });

  test('a member defining them passes', () => {
    assert.deepStrictEqual(
      findScriptProblems({
        scripts: new Set<string>([
          'check:types',
          'check:lint',
          'fix:lint',
          'check:test',
          'check:test:browser',
        ]),
        hasTsconfig: true,
        hasEslintConfig: true,
        hasTests: true,
        hasBrowserTests: true,
      }),
      [],
    );
  });

  test('a legacy name is refused even beside the current one', () => {
    assert.deepStrictEqual(
      findScriptProblems({
        scripts: new Set<string>([
          'check:types',
          'type-check',
          'lint',
          'lint:fix',
          'gi',
          'testw',
        ]),
        ...nothing,
        hasTsconfig: true,
      }),
      [
        '`type-check` is a legacy name; the sweeps run `check:types`',
        '`lint` is a legacy name; the sweeps run `check:lint`',
        '`lint:fix` is a legacy name; the sweeps run `fix:lint`',
        '`gi` is a legacy name; the sweeps run `gen`',
        '`testw` is a legacy name; the sweeps run `watch:test`',
      ],
    );
  });
});
