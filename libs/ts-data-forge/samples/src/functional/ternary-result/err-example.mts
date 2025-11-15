// Example: src/functional/ternary-result/impl/ternary-result-err.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const failure = TernaryResult.err(new Error('missing data'));

assert.strictEqual(failure.$$tag, 'ts-data-forge::Result.err');

assert.ok(TernaryResult.isErr(failure));
