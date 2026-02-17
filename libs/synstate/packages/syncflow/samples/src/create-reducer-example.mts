import { createReducer } from 'syncflow';
// embed-sample-code-ignore-above

const [state, dispatch] = createReducer(
  (s, action: Readonly<{ type: 'increment' } | { type: 'decrement' }>) => {
    switch (action.type) {
      case 'increment':
        return s + 1;
      case 'decrement':
        return s - 1;
    }
  },
  0,
);

state.subscribe((value: number) => {
  console.log(value);
});

dispatch({ type: 'increment' }); // logs: 1
