import { createState } from 'synstate';

// Create a reactive state
const [state, setState] = createState(0);

// Subscribe to changes
state.subscribe((count) => {
  console.log(count); // 0, 1
});

// Update state
setState(1);

// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}
