import { combine, map, source } from 'synstate';

const mode$ = source<'celsius' | 'fahrenheit'>('celsius');

const celsius$ = source(20);

const fahrenheit$ = source(68);

// embed-sample-code-ignore-above

const temperature$ = combine([mode$, celsius$, fahrenheit$]).pipe(
  map(([mode, c, f]) => (mode === 'celsius' ? c : f)),
);

// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional dependencies (synstate)', () => {
    assert.strictEqual(temperature$.getSnapshot().value, 20);
  });
}
