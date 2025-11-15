// Example: src/functional/result.mts (Result.isResult)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = Result.ok('success');

const errValue = Result.err(new Error('failure'));

const notResult = { $$tag: 'ts-data-forge::Result.ok' };

assert.ok(Result.isResult(okValue));

assert.ok(Result.isResult(errValue));

assert.notOk(Result.isResult(notResult));
