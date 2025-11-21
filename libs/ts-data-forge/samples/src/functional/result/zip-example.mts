// Example: src/functional/result.mts (Result.zip)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const first = Result.ok('left');

const second = Result.ok(1);

const expected = ['left', 1] as const;

assert.deepStrictEqual(Result.zip(first, second), Result.ok(expected));

assert.deepStrictEqual(
  Result.zip(first, Result.err('error')),
  Result.err('error'),
);
