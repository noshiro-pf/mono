import { type MergeIntersection } from 'ts-type-forge';

export type Subscription = Readonly<{
  unsubscribe: () => void;
}>;

export type TinyObservable<T> = Readonly<{
  subscribe: (fn: (value: T) => void) => Subscription;
}>;

export type TinyObservableSource<T> = MergeIntersection<
  Readonly<{ next: (value: T) => void }> & TinyObservable<T>
>;

/**
 * A multicast callback list, and nothing else.
 *
 * Ported from `@noshiro/ts-utils`; `ts-data-forge` has no successor. `synstate`
 * is the successor in spirit, but it carries a value and a graph, and the two
 * hooks here want neither.
 */
export const createTinyObservable = <T,>(): TinyObservableSource<T> => {
  const mut_subscriptions = new Map<symbol, (value: T) => void>();

  return {
    next: (value: T): void => {
      for (const fn of mut_subscriptions.values()) {
        fn(value);
      }
    },

    subscribe: (fn: (value: T) => void): Subscription => {
      const id = Symbol();

      mut_subscriptions.set(id, fn);

      return {
        unsubscribe: () => {
          mut_subscriptions.delete(id);
        },
      };
    },
  };
};
