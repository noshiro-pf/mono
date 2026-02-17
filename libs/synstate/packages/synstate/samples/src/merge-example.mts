import { merge, source } from 'synstate';
// embed-sample-code-ignore-above

const clicks$ = source<MouseEvent>();

const keys$ = source<KeyboardEvent>();

const events$ = merge([clicks$, keys$]);

events$.subscribe((event_) => {
  console.log(event_);
});
// Logs any mouse click or keyboard event
