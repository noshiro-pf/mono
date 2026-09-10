// Example: src/functional/async-result.mts (AsyncResult.flatMap)
import { AsyncResult, Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', async () => {
    // embed-sample-code-ignore-above
    const parseNumber = (text: string): Result<number, string> => {
      const num = Number.parseInt(text, 10);

      return Number.isNaN(num) ? Result.err('not a number') : Result.ok(num);
    };

    const input = AsyncResult.fromPromise(
      Promise.resolve('42'),
      () => 'failed',
    );

    const parsed = await AsyncResult.flatMap(input, parseNumber);

    assert.deepStrictEqual(parsed, Result.ok(42));

    // embed-sample-code-ignore-below
  });
}
