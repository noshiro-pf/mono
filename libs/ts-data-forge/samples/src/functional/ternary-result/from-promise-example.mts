// Example: src/functional/ternary-result/impl/ternary-result-from-promise.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const resolved = await TernaryResult.fromPromise(Promise.resolve('ok'));

const rejected = await TernaryResult.fromPromise(
  Promise.reject(new Error('fail')),
);

assert.deepStrictEqual(resolved, TernaryResult.ok('ok'));

assert.isTrue(TernaryResult.isErr(rejected));
