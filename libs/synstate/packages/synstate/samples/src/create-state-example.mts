import { createState } from 'synstate';
// embed-sample-code-ignore-above

const [state, setState, { updateState, resetState }] = createState(0);

state.subscribe((value: number) => {
  console.log(value);
}); // logs: 0

setState(10); // logs: 10

updateState((prev: number) => prev + 1); // logs: 11

resetState(); // logs: 0
