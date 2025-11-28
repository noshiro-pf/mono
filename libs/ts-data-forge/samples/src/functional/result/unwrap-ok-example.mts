// Example: src/functional/result.mts (Result.unwrapOk)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okResult = Result.ok(42);

const errResult = Result.err('oops');

// Result.unwrapOk returns the value for Ok results

assert.isTrue(Result.unwrapOk(okResult) === 42);

// Result.unwrapOk returns undefined for Err results

// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
assert.isTrue(Result.unwrapOk(errResult) === undefined);
