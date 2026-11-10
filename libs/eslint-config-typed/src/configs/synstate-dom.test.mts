import parser from '@typescript-eslint/parser';
import dedent from 'dedent';
import { Linter } from 'eslint';
import { plugins } from './plugins.mjs';
import { eslintConfigForSynstateDom } from './synstate-dom.mjs';

const plugin = plugins['synstate-dom-a11y'];

const linter = new Linter();

const config = eslintConfigForSynstateDom(['**/*.tsx']);

/** `code` linted as `file.tsx` with the preset and the plugin it names. */
const verify = (code: string): readonly Linter.LintMessage[] =>
  linter.verify(
    code,
    Array.from(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the preset's flat config and plugin, which ESLint validates
      [
        {
          languageOptions: { parser },
          plugins: { 'synstate-dom-a11y': plugin },
        },
        config,
      ] as unknown as readonly Linter.Config[],
    ),
    'file.tsx',
  );

describe(eslintConfigForSynstateDom, () => {
  test('turns on only rules the registered plugin has', () => {
    const missing = Object.keys(config.rules ?? {}).filter(
      (name) =>
        !name.startsWith('synstate-dom-a11y/') ||
        plugin.rules?.[name.slice('synstate-dom-a11y/'.length)] === undefined,
    );

    assert.deepStrictEqual(missing, []);
  });

  test('reports through the registered plugin, reading constant(x) as x', () => {
    const messages = verify(
      dedent`
        import { constant } from 'synstate-dom';
        const a = <div role={constant('bogus')} />;
      `,
    );

    assert.deepStrictEqual(
      messages.map((m) => m.ruleId),
      ['synstate-dom-a11y/aria-role'],
    );
  });

  test("leaves a file that imports nothing from synstate-dom to jsx-a11y's reading", () => {
    const messages = verify(
      dedent`
        const a = <div role={constant('bogus')} />;
      `,
    );

    assert.deepStrictEqual(messages, []);
  });
});
