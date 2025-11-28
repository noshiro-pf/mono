// Example: src/functional/result.mts (Result.unwrapErrOr)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okResult = Result.ok('success');

const errResult = Result.err('failure');

assert.isTrue(Result.unwrapErrOr(okResult, 'default') === 'default');

assert.isTrue(Result.unwrapErrOr(errResult, 'default') === 'failure');

const unwrapError = Result.unwrapErrOr('fallback error');

assert.isTrue(unwrapError(Result.err('boom')) === 'boom');

assert.isTrue(unwrapError(Result.ok('no error')) === 'fallback error');
