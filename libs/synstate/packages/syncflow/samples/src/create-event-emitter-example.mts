import { createValueEmitter } from 'syncflow';
// embed-sample-code-ignore-above

const [message$, emitMessage] = createValueEmitter<string>();

message$.subscribe((msg) => {
  console.log(msg);
});

emitMessage('Hello'); // logs: Hello
