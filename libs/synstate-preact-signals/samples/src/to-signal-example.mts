import { state } from 'synstate';
import { toSignal } from 'synstate-preact-signals';

if (import.meta.vitest !== undefined) {
  test('toSignal with InitializedObservable', () => {
    // embed-sample-code-ignore-above

    const count$ = state<number>(0);

    const countSignal = toSignal(count$);

    assert.strictEqual(countSignal.value, 0);

    count$.set(1);

    assert.strictEqual(countSignal.value, 1);

    count$.set(42);

    assert.strictEqual(countSignal.value, 42);

    // embed-sample-code-ignore-below
  });
}
