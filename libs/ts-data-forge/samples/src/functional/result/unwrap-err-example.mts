// Example: src/functional/result.mts (Result.unwrapErr)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okResult = Result.ok('data');

const errResult = Result.err('problem');

// Result.unwrapErr returns undefined for Ok results

// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
assert.isTrue(Result.unwrapErr(okResult) === undefined);

// Result.unwrapErr returns the error value for Err results

assert.isTrue(Result.unwrapErr(errResult) === 'problem');
