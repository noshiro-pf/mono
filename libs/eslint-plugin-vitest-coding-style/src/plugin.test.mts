import { Linter } from 'eslint';
import { eslintPluginVitestCodingStyle } from './plugin.mjs';

const linter = new Linter({ configType: 'flat' });

describe('eslintPluginVitestCodingStyle.configs.recommended', () => {
  const recommended = eslintPluginVitestCodingStyle.configs.recommended;

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins['vitest-coding-style']).toBe(
      eslintPluginVitestCodingStyle,
    );
  });

  test('leaves a JavaScript file alone, where no TypeScript program exists', () => {
    // A type-aware rule run without a program throws, and `verify` with it.
    const messages = linter.verify(
      'export const half = (n) => n / 2;\n',
      [asLinterConfig(recommended)],
      { filename: 'script.mjs' },
    );

    assert.deepStrictEqual(messages, []);
  });
});

/** The preset as `Linter` takes it: the same object, without its readonly types. */
const asLinterConfig = (config: unknown): Linter.Config =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a flat config object, which `Linter` reads and never mutates
  config as Linter.Config;
