import { derive, source } from 'synstate';
import { Optional } from 'ts-data-forge';

const mode$ = source<'celsius' | 'fahrenheit'>('celsius');

const celsius$ = source(20);

const fahrenheit$ = source(68);

// embed-sample-code-ignore-above

const temperature$ = derive([mode$, celsius$, fahrenheit$], (mode, c, f) =>
  mode === 'celsius' ? c : f,
);

// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional dependencies (synstate)', () => {
    assert.strictEqual(Optional.unwrap(temperature$.getSnapshot()), 20);
  });
}
