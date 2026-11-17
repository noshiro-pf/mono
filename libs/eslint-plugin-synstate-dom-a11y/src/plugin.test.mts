// cspell:ignore buton

import { Linter } from 'eslint';
// @ts-expect-error no type definition
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import { eslintPluginSynstateDomA11y } from './plugin.mjs';

const linter = new Linter({ configType: 'flat' });

describe('eslintPluginSynstateDomA11y', () => {
  test("has every jsx-a11y rule, by jsx-a11y's names", () => {
    assert.deepStrictEqual(
      Object.keys(eslintPluginSynstateDomA11y.rules).toSorted(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- jsx-a11y ships no types
      Object.keys(eslintPluginJsxA11y.rules).toSorted(),
    );
  });

  test("is named for this package, and versioned by its release and jsx-a11y's", () => {
    assert.strictEqual(
      eslintPluginSynstateDomA11y.meta.name,
      'eslint-plugin-synstate-dom-a11y',
    );

    assert.match(
      eslintPluginSynstateDomA11y.meta.version,
      /^\d+\.\d+\.\d+\+jsx-a11y\.\d+\.\d+\.\d+$/u,
    );
  });

  test.each(['recommended', 'strict'] as const)(
    "configs.%s is jsx-a11y's, renamed, and registers the plugin itself",
    (name) => {
      const preset = eslintPluginSynstateDomA11y.configs[name];

      // Registering a *copy* would make `Cannot redefine plugin` errors possible
      // for users who also list the plugin in their own `plugins` record.
      expect(preset.plugins?.['synstate-dom-a11y']).toBe(
        eslintPluginSynstateDomA11y,
      );

      assert.deepStrictEqual(
        Object.keys(preset.rules ?? {}),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- jsx-a11y ships no types
        Object.keys(eslintPluginJsxA11y.flatConfigs[name].rules).map((id) =>
          id.replace(/^jsx-a11y\//u, 'synstate-dom-a11y/'),
        ),
      );
    },
  );

  test('reads a role bound to constant(x) as x', () => {
    const verify = (code: string): readonly (string | null)[] =>
      linter
        .verify(
          code,
          [
            { files: ['**/*.jsx'] },
            eslintPluginSynstateDomA11y.configs.recommended,
          ],
          {
            filename: 'component.jsx',
          },
        )
        .map((m) => m.ruleId);

    assert.deepStrictEqual(
      verify(
        [
          "import { constant } from 'synstate-dom';",
          '',
          "export const C = () => <div role={constant('buton')} />;",
          '',
        ].join('\n'),
      ),
      ['synstate-dom-a11y/aria-role'],
    );

    assert.deepStrictEqual(
      verify(
        [
          "import { constant } from 'synstate-dom';",
          '',
          "export const C = () => <div role={constant('button')} />;",
          '',
        ].join('\n'),
      ),
      [],
    );
  });
});
