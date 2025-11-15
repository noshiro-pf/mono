// Example: src/functional/result.mts (Result.swap)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = Result.ok('value');

const errValue = Result.err('error');

assert.deepStrictEqual(Result.swap(okValue), Result.err('value'));

assert.deepStrictEqual(Result.swap(errValue), Result.ok('error'));
