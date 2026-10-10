import { produce } from 'immer';
import { castMutable } from 'ts-data-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    // Example: Immer produce function

    type State = Readonly<{
      items: readonly string[];
    }>;

    const initialState: State = {
      items: ['item1', 'item2'],
    } as const;

    const newItems = ['newItem1', 'newItem2'] as const;

    const updatedState = produce(initialState, (draft) => {
      // draft.items expects mutable array, but newItems is readonly
      draft.items = castMutable(newItems); // Safe cast for assignment
    });

    assert.deepStrictEqual(initialState.items, ['item1', 'item2']);

    assert.deepStrictEqual(updatedState.items, ['newItem1', 'newItem2']);

    // embed-sample-code-ignore-below
  });
}
