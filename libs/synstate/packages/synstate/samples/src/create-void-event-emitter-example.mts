import { createEventEmitter } from 'synstate';
// embed-sample-code-ignore-above

const [click$, emitClick] = createEventEmitter();

click$.subscribe(() => {
  console.log('Clicked!');
});

emitClick(); // logs: Clicked!
