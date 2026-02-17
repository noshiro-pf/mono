import { createBooleanState } from 'syncflow';
// embed-sample-code-ignore-above

const [state, { setTrue, toggle }] = createBooleanState(false);

state.subscribe((value: boolean) => {
  console.log(value);
}); // logs: false

setTrue(); // logs: true

toggle(); // logs: false

toggle(); // logs: true
