import { source, type Observable } from '../core';

export const createVoidEventEmitter = (): [Observable<void>, () => void] => {
  const src$ = source<undefined>();

  const emitter = (): void => {
    src$.next(undefined);
  };

  return [src$, emitter];
};

export const createEventEmitter = <A>(): [
  Observable<A>,
  (value: A) => void,
] => {
  const src$ = source<A>();

  const emitter = (value: A): void => {
    src$.next(value);
  };

  return [src$, emitter];
};
