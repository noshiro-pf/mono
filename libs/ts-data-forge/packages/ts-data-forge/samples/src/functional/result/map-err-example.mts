// Example: src/functional/result.mts (Result.mapErr)
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okValue = Result.ok(3) as Result<number, string>;

    const errValue = Result.err('missing');

    const untouchedOk = Result.mapErr(okValue, (error) => error.toUpperCase());

    const uppercasedErr = Result.mapErr(errValue, (error) =>
      error.toUpperCase(),
    );

    assert.deepStrictEqual(untouchedOk, Result.ok(3));

    assert.deepStrictEqual(uppercasedErr, Result.err('MISSING'));

    const mapError = Result.mapErr((error: Readonly<Error>) => error.message);

    const wrapped = mapError(Result.err(new Error('boom')));

    assert.deepStrictEqual(wrapped, Result.err('boom'));

    // embed-sample-code-ignore-below
  });
}
