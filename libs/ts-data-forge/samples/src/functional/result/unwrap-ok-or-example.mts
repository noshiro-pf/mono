// Example: src/functional/result.mts (Result.unwrapOkOr)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = Result.ok(10);

const errValue = Result.err('fail');

assert(Result.unwrapOkOr(okValue, 0) === 10);

assert(Result.unwrapOkOr(errValue, 0) === 0);

const unwrapWithDefault = Result.unwrapOkOr(5);

assert(unwrapWithDefault(Result.ok(3)) === 3);

assert(unwrapWithDefault(Result.err('no data')) === 5);
