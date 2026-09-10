// Example: src/panic/panic.mts (panic, error)
import { panic } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const boom = new Error('boom');

    assert.throws(() => panic(boom), Error, 'boom');

    // embed-sample-code-ignore-below
  });
}
