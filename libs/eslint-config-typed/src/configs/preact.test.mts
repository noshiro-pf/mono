import parser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import eslintPluginReact from 'eslint-plugin-react';
import { Arr } from 'ts-data-forge';
import { mergeRestrictedImportsOptions } from '../rules/index.mjs';
import {
  eslintConfigForPreact,
  restrictedImportsOptionsForPreact,
} from './preact.mjs';

const linter = new Linter();

/** The entry of `ruleName` in the last config that sets it. */
const lastEntryOf = (
  ruleName: 'no-restricted-imports' | 'react/no-unknown-property',
): unknown => {
  const entry = eslintConfigForPreact()
    .map((config) => config.rules?.[ruleName])
    .findLast((e) => e !== undefined);

  assert.isDefined(entry);

  return entry;
};

/** The options of the entry, copied because `Linter` takes a mutable tuple. */
const lastOptionsOf = (
  ruleName: 'no-restricted-imports' | 'react/no-unknown-property',
): unknown => {
  const entry = lastEntryOf(ruleName);

  return Arr.isArray(entry) ? entry[1] : undefined;
};

/**
 * Lints `code` with `react/no-unknown-property` set as `eslintConfigForPreact`
 * leaves it, i.e. by the last config that sets it.
 */
const lintNoUnknownProperty = (code: string): readonly string[] => {
  const messages = linter.verify(
    code,
    {
      files: ['**/*.tsx'],
      languageOptions: {
        parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { react: eslintPluginReact },
      rules: {
        'react/no-unknown-property': [
          'error',
          lastOptionsOf('react/no-unknown-property'),
        ],
      },
    },
    'file.tsx',
  );

  return messages.map((m) => m.message);
};

/** Lints `code` with `no-restricted-imports` as `eslintConfigForPreact` sets it. */
const lintNoRestrictedImports = (code: string): readonly string[] => {
  const messages = linter.verify(
    code,
    {
      rules: {
        'no-restricted-imports': [
          'error',
          lastOptionsOf('no-restricted-imports'),
        ],
      },
    },
    'file.mjs',
  );

  return messages.map((m) => m.message);
};

describe(eslintConfigForPreact, () => {
  describe('react/no-unknown-property', () => {
    test('accepts the lower-case tabindex, which Preact needs on SVG elements', () => {
      assert.deepStrictEqual(
        lintNoUnknownProperty('const e = <rect tabindex={0} />;'),
        [],
      );
    });

    test('accepts onDblClick, the DOM event name Preact takes', () => {
      assert.deepStrictEqual(
        lintNoUnknownProperty('const e = <div onDblClick={f} />;'),
        [],
      );
    });

    test('keeps the css prop the base config allows', () => {
      assert.deepStrictEqual(
        lintNoUnknownProperty('const e = <div css={s} />;'),
        [],
      );
    });

    test('still reports an unknown property', () => {
      expect(
        lintNoUnknownProperty('const e = <div class="a" />;'),
      ).toHaveLength(1);
    });
  });

  describe('no-restricted-imports', () => {
    test('keeps the base pattern against importing index.mjs by relative path', () => {
      expect(
        lintNoRestrictedImports("import { a } from './index.mjs';"),
      ).toHaveLength(1);
    });

    test('restricts the hooks of preact/compat', () => {
      expect(
        lintNoRestrictedImports("import { useState } from 'preact/compat';"),
      ).toHaveLength(1);
    });

    test('is set with restrictedImportsOptionsForPreact', () => {
      assert.deepStrictEqual(lastEntryOf('no-restricted-imports'), [
        'error',
        restrictedImportsOptionsForPreact,
      ]);
    });
  });
});

describe(mergeRestrictedImportsOptions, () => {
  test('concatenates paths and patterns in order', () => {
    assert.deepStrictEqual(
      mergeRestrictedImportsOptions(
        { paths: [{ name: 'a' }], patterns: [{ group: ['x'] }] },
        { paths: [{ name: 'b' }] },
        { patterns: [{ regex: 'y' }] },
      ),
      {
        paths: [{ name: 'a' }, { name: 'b' }],
        patterns: [{ group: ['x'] }, { regex: 'y' }],
      },
    );
  });
});
