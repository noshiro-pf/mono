// The example is the function it defines, so it stays where a reader
// meets it rather than being hoisted out of the snippet.
/* eslint-disable unicorn/consistent-function-scoping */
// Example: src/panic/panic.mts (todo)
import { todo } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const parse = (_input: string): number => todo('parse');

    assert.throws(() => parse('x'), Error, 'not implemented: parse');

    // embed-sample-code-ignore-below
  });
}
