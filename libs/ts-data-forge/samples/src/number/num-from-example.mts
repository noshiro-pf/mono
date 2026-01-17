// Example: src/number/num.mts (Num.from)
import { Num } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input = '123.45';

    const result = Num.from(input);

    assert.isTrue(result === 123.45);

    // embed-sample-code-ignore-below
  });
}
