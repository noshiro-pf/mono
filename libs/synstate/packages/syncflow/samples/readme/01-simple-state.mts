import { createState } from 'syncflow';

// Create a reactive state
const [state, setState, { updateState }] = createState(0);

// Subscribe to changes (in React components, Vue watchers, etc.)
state.subscribe((count: number) => {
  console.log('Count:', count);
});

// Update state
setState(1);

updateState((prev: number) => prev + 1);
