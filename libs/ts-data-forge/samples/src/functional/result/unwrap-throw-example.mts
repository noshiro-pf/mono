// Example: src/functional/result.mts (Result.unwrapThrow)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okResult = Result.ok('data');

const errResult = Result.err(new Error('fail'));

assert.isTrue(Result.unwrapThrow(okResult) === 'data');

assert.throws(() => Result.unwrapThrow(errResult), /fail/u);
