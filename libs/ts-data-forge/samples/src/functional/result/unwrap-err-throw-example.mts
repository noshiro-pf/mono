// Example: src/functional/result.mts (Result.unwrapErrThrow)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const errResult = Result.err(new Error('broken'));

const okResult = Result.ok('value');

assert.isTrue(Result.unwrapErrThrow(errResult).message === 'broken');

assert.throws(() => Result.unwrapErrThrow(okResult), /Expected Err/u);
