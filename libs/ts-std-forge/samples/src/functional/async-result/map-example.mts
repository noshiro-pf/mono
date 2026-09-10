// Example: src/functional/async-result.mts (AsyncResult.map)
import { AsyncResult, Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', async () => {
    // embed-sample-code-ignore-above
    const okValue = AsyncResult.fromPromise(Promise.resolve(5), () => 'failed');

    const doubled = await AsyncResult.map(okValue, (value) => value * 2);

    assert.deepStrictEqual(doubled, Result.ok(10));

    const double = AsyncResult.map((value: number) => value * 2);

    const curried = await double(
      AsyncResult.fromPromise(Promise.resolve(21), () => 'failed'),
    );

    assert.deepStrictEqual(curried, Result.ok(42));

    // embed-sample-code-ignore-below
  });
}
