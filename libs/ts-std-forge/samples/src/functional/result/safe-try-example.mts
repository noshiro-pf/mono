// Example: src/functional/result.mts (Result.safeTry)
import { Result, SafeNumber } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type ParseError = Readonly<{ kind: 'invalid-integer'; input: string }>;

    const parseTwo = (a: string, b: string): Result<number, ParseError> =>
      Result.safeTry(function* () {
        const x = yield* Result.safeUnwrap(SafeNumber.parseInteger(a));

        const y = yield* Result.safeUnwrap(SafeNumber.parseInteger(b));

        return Result.ok(x + y);
      });

    assert.deepStrictEqual(parseTwo('1', '2'), Result.ok(3));

    assert.isTrue(Result.isErr(parseTwo('1', 'not a number')));

    // embed-sample-code-ignore-below
  });
}
