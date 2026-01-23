// Example: src/functional/result.mts (Result.expectToBe)
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', (): void => {
    // embed-sample-code-ignore-above
    const okValue = Result.ok('data');

    assert.isTrue(Result.expectToBe(okValue, 'should have value') === 'data');

    const expectResult = Result.expectToBe<string>('missing result');

    const throwTest = (): void => {
      expectResult(Result.err('boom'));
    };

    assert.throws(throwTest, /missing result/u);

    assert.isTrue(expectResult(Result.ok('value')) === 'value');

    // embed-sample-code-ignore-below
  });
}
