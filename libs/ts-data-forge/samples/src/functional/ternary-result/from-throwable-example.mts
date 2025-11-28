// Example: src/functional/ternary-result/impl/ternary-result-from-throwable.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const success = TernaryResult.fromThrowable(() => 1 + 1);

const failure = TernaryResult.fromThrowable(() => {
  throw new Error('boom');
});

assert.deepStrictEqual(success, TernaryResult.ok(2));

assert.isTrue(TernaryResult.isErr(failure));
