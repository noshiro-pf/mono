import { source, type Observable } from '../core/index.mjs';

/** An event source of `undefined`, and the function that emits it. */
export const createEventEmitter = (): readonly [
  event: Observable<void>,
  emit: () => void,
] => {
  const node = source<undefined>();

  return [
    node,
    () => {
      node.emit(undefined);
    },
  ] as const;
};

/** An event source of `A`, and the function that emits a value on it. */
export const createValueEmitter = <A,>(): readonly [
  event: Observable<A>,
  emit: (value: A) => void,
] => {
  const node = source<A>();

  return [
    node,
    (value) => {
      node.emit(value);
    },
  ] as const;
};
