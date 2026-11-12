import tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import { eslintPluginTsRestrictions } from './plugin.mjs';

const linter = new Linter({ configType: 'flat' });

describe('eslintPluginTsRestrictions.configs.recommended', () => {
  const recommended = eslintPluginTsRestrictions.configs.recommended;

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins['ts-restrictions']).toBe(
      eslintPluginTsRestrictions,
    );
  });

  test('leaves a JavaScript file alone, where no TypeScript program exists', () => {
    // A type-aware rule run without a program throws, and `verify` with it.
    const messages = linter.verify(
      'const s = "ab";\nexport const chars = [...s];\n',
      [asLinterConfig(recommended)],
      { filename: 'script.mjs' },
    );

    assert.deepStrictEqual(messages, []);
  });

  test('runs on a TypeScript file', () => {
    const messages = linter.verify(
      'export const inRange = (x: number): boolean => x >= 0 && 10 >= x;\n',
      [
        asLinterConfig(recommended),
        {
          files: ['**/*.mts'],
          languageOptions: {
            parser: tsParser,
            parserOptions: {
              projectService: { allowDefaultProject: ['*.mts'] },
              tsconfigRootDir: `${import.meta.dirname}/..`,
            },
          },
        },
      ],
      { filename: `${import.meta.dirname}/../in-range.mts` },
    );

    assert.deepStrictEqual(
      messages.map((m) => m.ruleId),
      ['ts-restrictions/prefer-range-in-number-line-order'],
    );
  });
});

/** The preset as `Linter` takes it: the same object, without its readonly types. */
const asLinterConfig = (config: unknown): Linter.Config =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a flat config object, which `Linter` reads and never mutates
  config as Linter.Config;
