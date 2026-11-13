import tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import { eslintPluginTsUiRestrictions } from './plugin.mjs';

const linter = new Linter({ configType: 'flat' });

describe('eslintPluginTsUiRestrictions.configs.recommended', () => {
  const recommended = eslintPluginTsUiRestrictions.configs.recommended;

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins['ts-ui-restrictions']).toBe(
      eslintPluginTsUiRestrictions,
    );
  });

  test('leaves a JavaScript file alone, where no TypeScript program exists', () => {
    // A type-aware rule run without a program throws, and `verify` with it.
    const messages = linter.verify(
      "export const onKeyDown = (e) => e.key === 'Enter';\n",
      [asLinterConfig(recommended)],
      { filename: 'script.mjs' },
    );

    assert.deepStrictEqual(messages, []);
  });

  test('runs on a TypeScript file', () => {
    const messages = linter.verify(
      [
        'type KeyboardEvent = Readonly<{ key: string; isComposing: boolean }>;',
        '',
        'export const onKeyDown = (e: KeyboardEvent): boolean =>',
        "  e.key === 'Enter';",
        '',
      ].join('\n'),
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
      { filename: `${import.meta.dirname}/../on-key-down.mts` },
    );

    assert.deepStrictEqual(
      messages.map((m) => m.ruleId),
      ['ts-ui-restrictions/require-ime-guard'],
    );
  });
});

/** The preset as `Linter` takes it: the same object, without its readonly types. */
const asLinterConfig = (config: unknown): Linter.Config =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a flat config object, which `Linter` reads and never mutates
  config as Linter.Config;
