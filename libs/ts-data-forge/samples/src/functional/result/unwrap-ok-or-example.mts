// Example: src/functional/result.mts (Result.unwrapOkOr)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = Result.ok(10);

const errValue = Result.err('fail');

assert.isTrue(Result.unwrapOkOr(okValue, 0) === 10);

assert.isTrue(Result.unwrapOkOr(errValue, 0) === 0);

const unwrapWithDefault = Result.unwrapOkOr(5);

assert.isTrue(unwrapWithDefault(Result.ok(3)) === 3);

assert.isTrue(unwrapWithDefault(Result.err('no data')) === 5);
