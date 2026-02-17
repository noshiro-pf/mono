import { source, throttleTime } from 'syncflow';
// embed-sample-code-ignore-above

const scroll$ = source<Event>();

const throttled$ = scroll$.pipe(throttleTime(1000));

throttled$.subscribe((event_) => {
  console.log(event_);
});
// Emits at most once per second
