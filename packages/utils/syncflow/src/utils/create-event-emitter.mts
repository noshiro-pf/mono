import { source, type Observable } from '../core/index.mjs';

export const createVoidEventEmitter = (): readonly [
  Observable<void>,
  () => void,
] => {
  const src$ = source<undefined>();

  const emitter = (): void => {
    src$.next(undefined);
  };

  return [src$, emitter];
};

export const createEventEmitter = <A,>(): readonly [
  Observable<A>,
  (value: A) => void,
] => {
  const src$ = source<A>();

  const emitter = (value: A): void => {
    src$.next(value);
  };

  return [src$, emitter];
};
