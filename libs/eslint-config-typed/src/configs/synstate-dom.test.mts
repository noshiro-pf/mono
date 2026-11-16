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
          plugins: {
            'synstate-dom-a11y': plugin,
            synstate: plugins.synstate,
          },
        },
        config,
      ] as unknown as readonly Linter.Config[],
    ),
    'file.tsx',
  );

describe(eslintConfigForSynstateDom, () => {
  test('turns on only rules the registered plugins have', () => {
    const registered = new Map(Object.entries(plugins));

    const missing = Object.keys(config.rules ?? {}).filter((name) => {
      const slash = name.lastIndexOf('/');

      const prefix = name.slice(0, slash);

      const rule = name.slice(slash + 1);

      return registered.get(prefix)?.rules?.[rule] === undefined;
    });

    assert.deepStrictEqual(missing, []);
  });

  test('reports onFocus on an element that cannot take the focus', () => {
    const messages = verify(
      dedent`
        const a = <div onFocus={() => {}}><input /></div>;
      `,
    );

    assert.include(
      messages.map((m) => m.ruleId),
      'synstate/no-unfocusable-focus-handler',
    );
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

  test("reports synstate-dom's autofocus, the DOM property's spelling", () => {
    const messages = verify(
      dedent`
        const a = <input autofocus />;
      `,
    );

    assert.deepStrictEqual(
      messages.map((m) => m.ruleId),
      ['synstate-dom-a11y/no-autofocus'],
    );
  });

  test('does not report an SVG element given a role in prefer-tag-over-role', () => {
    const messages = verify(
      dedent`
        import { constant } from 'synstate-dom';
        const a = (
          <svg aria-label={constant('chart')} role={constant('img')}>
            <g role={constant('button')} tabindex={constant(0)} />
          </svg>
        );
      `,
    );

    assert.deepStrictEqual(
      messages
        .map((m) => m.ruleId)
        .filter((id) => id === 'synstate-dom-a11y/prefer-tag-over-role'),
      [],
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
