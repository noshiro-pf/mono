import { createEventEmitter, source, takeUntil } from 'syncflow';
// embed-sample-code-ignore-above

const num$ = source<number>();

const [stopNotifier, stop_] = createEventEmitter();

const limited$ = num$.pipe(takeUntil(stopNotifier));

limited$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // logs: 1

num$.next(2); // logs: 2

stop_();

num$.next(3); // nothing logged (completed)
