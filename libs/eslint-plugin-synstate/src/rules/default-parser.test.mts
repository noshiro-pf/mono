import dedent from 'dedent';
import { Linter } from 'eslint';
import { eslintPluginSynstate } from '../plugin.mjs';

// ESLint's default parser, which reads `.js` and `.mjs` files, leaves out
// `importKind`: an import is a value import unless it says `type`.

const linter = new Linter();

/** `code` as `eslint --fix` leaves it with `rule` alone on, read by espree. */
const fixWithDefaultParser = (rule: 'no-identity-map', code: string): string =>
  linter.verifyAndFix(
    code,
    {
      files: ['**/*.mjs'],
      plugins: {
        // `Linter` takes the plugin as mutable; this one is deeply readonly.
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        synstate: eslintPluginSynstate as never,
      },
      rules: { [`synstate/${rule}`]: 'error' },
    },
    'file.mjs',
  ).output;

describe('fixes in a file the default parser reads', () => {
  test('no-identity-map uses the name already imported', () => {
    expect(
      fixWithDefaultParser(
        'no-identity-map',
        dedent`
          import { map, skipIfNoChange } from 'synstate';
          const a$ = x$.pipe(map((x) => x));
        `,
      ),
    ).toBe(dedent`
      import { map, skipIfNoChange } from 'synstate';
      const a$ = x$.pipe(skipIfNoChange());
    `);
  });

  test('no-identity-map leaves a call where a parameter takes the name', () => {
    const code = dedent`
      import { map } from 'synstate';
      const f = (skipIfNoChange) => x$.pipe(map((x) => x));
    `;

    expect(fixWithDefaultParser('no-identity-map', code)).toBe(code);
  });
});
