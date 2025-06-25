import { castMutable } from 'ts-data-forge';

const readonlyOptions: readonly string[] = ['Option 1', 'Option 2', 'Option 3'];

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

// Example with a function that expects mutable array
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const processItems = (mut_items: string[]): void => {
  mut_items.push('New Item');
  console.log('Items:', mut_items);
};

// Use castMutable to safely pass readonly array to mutable API
processItems(castMutable(readonlyOptions));

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

if (import.meta.vitest !== undefined) {
  expect(updatedState.items).toStrictEqual(['newItem1', 'newItem2']);
}

// Demonstrating type safety
const mutableCopy = castMutable(readonlyOptions);

if (import.meta.vitest !== undefined) {
  expect(mutableCopy).toStrictEqual(['Option 1', 'Option 2', 'Option 3']);
  expect(readonlyOptions).toStrictEqual(['Option 1', 'Option 2', 'Option 3']);
}
