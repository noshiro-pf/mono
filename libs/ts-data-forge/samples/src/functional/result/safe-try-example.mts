// Example: src/functional/result.mts (Result.safeTry)
import { Num, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const parseTwo = (a: string, b: string): Result<number, Error> =>
      Result.safeTry(function* () {
        const x = yield* Result.safeUnwrap(Num.safeParseInt(a));

        const y = yield* Result.safeUnwrap(Num.safeParseInt(b));

        return Result.ok(x + y);
      });

    assert.deepStrictEqual(parseTwo('1', '2'), Result.ok(3));

    assert.isTrue(Result.isErr(parseTwo('1', 'not a number')));

    // embed-sample-code-ignore-below
  });
}
