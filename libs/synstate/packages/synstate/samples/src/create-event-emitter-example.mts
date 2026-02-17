import { createValueEmitter } from 'synstate';
// embed-sample-code-ignore-above

const [message$, emitMessage] = createValueEmitter<string>();

message$.subscribe((msg) => {
  console.log(msg);
});

emitMessage('Hello'); // logs: Hello
