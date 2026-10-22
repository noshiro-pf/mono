// Example: src/functional/async-data/impl/async-data-match.mts
import { AsyncData, Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const render = AsyncData.match({
      idle: () => 'Press the button',
      pending: (previous: Optional<number>) =>
        Optional.isSome(previous) ? `Updating ${previous.value}` : 'Loading',
      ok: (value: number) => `Value: ${value}`,
      err: (error: string) => `Failed: ${error}`,
    });

    assert.strictEqual(render(AsyncData.idle), 'Press the button');

    assert.strictEqual(render(AsyncData.pending()), 'Loading');

    assert.strictEqual(
      render(AsyncData.pending(Optional.some(1))),
      'Updating 1',
    );

    assert.strictEqual(render(AsyncData.ok(2)), 'Value: 2');

    assert.strictEqual(render(AsyncData.err('timeout')), 'Failed: timeout');

    // embed-sample-code-ignore-below
  });
}
