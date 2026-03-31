/* eslint-disable @typescript-eslint/strict-void-return */
// embed-sample-code-ignore-above

import * as React from 'react';
import { createState } from 'synstate-react-hooks';

// State
const [useItemsState, _, { updateState, resetState: resetItemsState }] =
  createState<readonly string[]>([]);

// Setup event handlers
const addItem = (item: string): void => {
  updateState((items: readonly string[]) => [...items, item]);
};

// Component 1: Add items
const ItemInput = (): React.JSX.Element => {
  const [input, setInput] = React.useState<string>('');

  return (
    <div>
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />
      <button
        onClick={() => {
          addItem(input);

          setInput('');
        }}
      >
        {'Add'}
      </button>
    </div>
  );
};

// Component 2: Display items
const ItemList = (): React.JSX.Element => {
  const items = useItemsState();

  return (
    <div>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <button onClick={resetItemsState}>{'Clear All'}</button>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(ItemInput, ItemList);
