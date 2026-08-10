// Example: src/array/array-utils.mts (values)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const players = ['Ada', 'Grace', 'Alan'] as readonly string[];

    const valueList = Array.from(Arr.values(players));

    assert.deepStrictEqual(valueList, players);

    // embed-sample-code-ignore-below
  });
}
