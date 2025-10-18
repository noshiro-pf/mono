// Example: src/functional/result.mts (Result.unwrapErrOr)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okResult = Result.ok('success');
const errResult = Result.err('failure');

assert(Result.unwrapErrOr(okResult, 'default') === 'default');
assert(Result.unwrapErrOr(errResult, 'default') === 'failure');

const unwrapError = Result.unwrapErrOr('fallback error');

assert(unwrapError(Result.err('boom')) === 'boom');
assert(unwrapError(Result.ok('no error')) === 'fallback error');
