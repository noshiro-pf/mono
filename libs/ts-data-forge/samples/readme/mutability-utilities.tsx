import { castMutable } from 'ts-data-forge';

// Example: Material-UI Autocomplete
import { Autocomplete, TextField } from '@mui/material';

export const SomeComponent: React.FC = () => (
  <Autocomplete
    options={castMutable(readonlyOptions)}
    renderInput={(params) => (
      <TextField {...params} placeholder="Select an option" />
    )}
  />
);

const readonlyOptions: readonly string[] = ['Option 1', 'Option 2', 'Option 3'];

// Immer.js example
import { produce } from 'immer';

type State = Readonly<{
  items: readonly string[];
}>;

const initialState: State = {
  items: ['item1', 'item2'],
} as const;

const newItems: readonly string[] = ['newItem1', 'newItem2'];

const updatedState = produce(initialState, (draft) => {
  // draft.items expects mutable array, but newItems is readonly
  draft.items = castMutable(newItems); // Safe cast for assignment
});

assert.deepStrictEqual(initialState.items, ['item1', 'item2']);
assert.deepStrictEqual(updatedState.items, ['newItem1', 'newItem2']);
