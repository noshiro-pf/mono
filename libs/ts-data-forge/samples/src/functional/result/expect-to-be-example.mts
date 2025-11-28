// Example: src/functional/result.mts (Result.expectToBe)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = Result.ok('data');

assert.isTrue(Result.expectToBe(okValue, 'should have value') === 'data');

const expectResult = Result.expectToBe<string>('missing result');

assert.throws(() => expectResult(Result.err('boom')), /missing result/u);

assert.isTrue(expectResult(Result.ok('value')) === 'value');
