// Example: src/functional/result.mts (Result.flatMap)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const parseNumber = (input: string): Result<number, string> => {
  const num = Number.parseInt(input, 10);

  return Number.isNaN(num) ? Result.err('not a number') : Result.ok(num);
};

const parsed = Result.flatMap(Result.ok('42'), parseNumber);

const failure = Result.flatMap(Result.ok('abc'), parseNumber);

const passthrough = Result.flatMap(Result.err('fail'), parseNumber);

assert.deepStrictEqual(parsed, Result.ok(42));

assert.deepStrictEqual(failure, Result.err('not a number'));

assert.deepStrictEqual(passthrough, Result.err('fail'));

const parseThenDouble = Result.flatMap((input: string) =>
  Result.map(parseNumber(input), (value) => value * 2),
);

assert.deepStrictEqual(parseThenDouble(Result.ok('10')), Result.ok(20));
