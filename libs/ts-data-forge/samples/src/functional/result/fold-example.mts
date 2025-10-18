// Example: src/functional/result.mts (Result.fold)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = Result.ok(2);
const errValue = Result.err('bad');

const foldedOk = Result.fold(
  okValue,
  (value) => value * 2,
  (error) => error,
);
const foldedErr = Result.fold(
  errValue,
  (value: number) => value * 2,
  (error) => error.toUpperCase(),
);

assert.deepStrictEqual(foldedOk, Result.ok(4));
assert.deepStrictEqual(foldedErr, Result.err('BAD'));

const foldNumbers = Result.fold(
  (value: number) => value * 3,
  (error: string) => error.length,
);

assert.deepStrictEqual(foldNumbers(Result.ok(3)), Result.ok(9));
assert.deepStrictEqual(foldNumbers(Result.err('oops')), Result.err(4));
