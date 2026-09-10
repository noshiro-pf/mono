// The example is the function it defines, so it stays where a reader
// meets it rather than being hoisted out of the snippet.
/* eslint-disable unicorn/consistent-function-scoping */
// Example: src/panic/panic.mts (panic, message)
import { panic } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const get = (map: ReadonlyMap<string, number>, key: string): number =>
      map.get(key) ?? panic(`missing key: ${key}`);

    assert.throws(() => get(new Map(), 'a'), Error, 'missing key: a');

    // embed-sample-code-ignore-below
  });
}
