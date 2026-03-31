/* eslint-disable unicorn/prefer-ternary */
import { atom, createStore } from 'jotai';

const modeAtom = atom<'celsius' | 'fahrenheit'>('celsius');

const celsiusAtom = atom(20);

const fahrenheitAtom = atom(68);

// embed-sample-code-ignore-above

const temperatureAtom = atom((get) => {
  const mode = get(modeAtom);

  if (mode === 'celsius') return get(celsiusAtom);
  else return get(fahrenheitAtom);
});

// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional dependencies (jotai)', () => {
    const store = createStore();

    assert.strictEqual(store.get(temperatureAtom), 20);
  });
}
