// Example: src/array/array-utils.mts (setIntersection)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const refs = ['Ada', 'Alan', 'Grace'] as const;

    const attendees = ['Grace', 'Alan', 'Barbara'] as const;

    const both = Arr.setIntersection(refs, attendees);

    assert.deepStrictEqual(both, ['Alan', 'Grace']);

    // embed-sample-code-ignore-below
  });
}
