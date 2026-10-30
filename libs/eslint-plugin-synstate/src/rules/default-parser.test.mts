import dedent from 'dedent';
import { Linter } from 'eslint';
import { eslintPluginSynstate } from '../plugin.mjs';

// ESLint's default parser, which reads `.js` and `.mjs` files, leaves out
// `importKind`: an import is a value import unless it says `type`.

const linter = new Linter();

/** `code` as `eslint --fix` leaves it with `rule` alone on, read by espree. */
const fixWithDefaultParser = (
  rule: 'no-identity-map' | 'prefer-derive' | 'prefer-map-to',
  code: string,
): string =>
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
  test('prefer-map-to adds the name to the import', () => {
    expect(
      fixWithDefaultParser(
        'prefer-map-to',
        dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe(map(() => true));
        `,
      ),
    ).toBe(dedent`
      import { map, mapTo } from 'synstate';
      const on$ = opened$.pipe(mapTo(true));
    `);
  });

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

  test('prefer-derive adds the name to the import', () => {
    expect(
      fixWithDefaultParser(
        'prefer-derive',
        dedent`
          import { combine, map } from 'synstate';
          const sum$ = combine([a$, b$]).pipe(map(([a, b]) => a + b));
        `,
      ),
    ).toBe(dedent`
      import { combine, map, derive } from 'synstate';
      const sum$ = derive([a$, b$], (a, b) => a + b);
    `);
  });
});
