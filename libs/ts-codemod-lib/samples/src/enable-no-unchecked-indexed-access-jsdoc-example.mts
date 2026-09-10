import dedent from 'dedent';
import {
  enableNoUncheckedIndexedAccessTransformer,
  transformSourceCode,
} from 'ts-codemod-lib';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const before = dedent`
      declare const xs: readonly number[];
      declare const pair: readonly [number, number];
      declare const rec: Record<string, number>;
      declare const known: { a: number };

      xs[0].toFixed();
      rec['a'].toFixed();
      rec.a.toFixed();
      pair[1].toFixed();
      known.a.toFixed();
    `;

    const after = transformSourceCode(before, false, [
      enableNoUncheckedIndexedAccessTransformer(),
    ]);

    assert.deepStrictEqual(
      after.trim(),
      dedent`
        declare const xs: readonly number[];
        declare const pair: readonly [number, number];
        declare const rec: Record<string, number>;
        declare const known: { a: number };

        xs[0]!.toFixed();
        rec['a']!.toFixed();
        rec.a!.toFixed();
        pair[1].toFixed();
        known.a.toFixed();
      `,
    );

    // embed-sample-code-ignore-below
  });
}
