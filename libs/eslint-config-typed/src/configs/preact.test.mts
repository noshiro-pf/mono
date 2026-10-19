import parser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import eslintPluginReact from 'eslint-plugin-react';
import { Arr } from 'ts-data-forge';
import { eslintConfigForPreact } from './preact.mjs';

const linter = new Linter();

/**
 * Lints `code` with `react/no-unknown-property` set as `eslintConfigForPreact`
 * leaves it, i.e. by the last config that sets it.
 */
const lintNoUnknownProperty = (code: string): readonly string[] => {
  const entry = eslintConfigForPreact()
    .map((config) => config.rules?.['react/no-unknown-property'])
    .findLast((e) => e !== undefined);

  assert.isDefined(entry);

  // Only the options are under test; `Linter` takes a mutable tuple.
  const options: unknown = Arr.isArray(entry) ? entry[1] : undefined;

  const messages = linter.verify(
    code,
    {
      files: ['**/*.tsx'],
      languageOptions: {
        parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { react: eslintPluginReact },
      rules: { 'react/no-unknown-property': ['error', options] },
    },
    'file.tsx',
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
});
