import { BehaviorSubject, Observable } from 'rxjs';
import { createSignal, onCleanup } from 'solid-js';

export const useStreamValue = <T>(
  stream$: Observable<T>,
  initialValue: T
): (() => T) => {
  const [getValue, setValue] = createSignal<T>(initialValue);

  const subscription = stream$.subscribe(setValue);
  onCleanup(() => {
    subscription.unsubscribe();
  });

  return getValue;
};

export const useStateAsStream = <T>(
  initialValue: T
): [Observable<T>, (nextValue: T) => void] => {
  const stream$ = new BehaviorSubject<T>(initialValue);
  const next = (nextValue: T): void => {
    stream$.next(nextValue);
  };

  return [stream$, next];
};
