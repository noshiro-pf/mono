import * as React from 'react';
import { createEventEmitter, createState, createValueEmitter } from 'synstate';

// Events
const [onItemAdded$, emitItemAdded] = createValueEmitter<string>();

const [onClearAll$, emitClearAll] = createEventEmitter();

// State
const [itemsState, setItemsState, { updateState, getSnapshot }] = createState<
  readonly string[]
>([]);

// Setup event handlers
onItemAdded$.subscribe((item) => {
  updateState((items: readonly string[]) => [...items, item]);
});

onClearAll$.subscribe(() => {
  setItemsState([]);
});

// Component 1: Add items
const ItemInput = (): React.JSX.Element => {
  const [input, setInput] = React.useState('');

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
          emitItemAdded(input);

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
  const [items, setItems] = React.useState(getSnapshot());

  React.useEffect(() => {
    const sub = itemsState.subscribe(setItems);

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return (
    <div>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <button onClick={emitClearAll}>{'Clear All'}</button>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(ItemInput, ItemList);
