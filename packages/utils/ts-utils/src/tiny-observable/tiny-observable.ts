import { MutableMap } from '../others';

export type Subscription = Readonly<{
  unsubscribe: () => void;
}>;

export type TinyObservable<T> = Readonly<{
  subscribe: (fn: (value: T) => void) => Subscription;
}>;

export type TinyObservableSource<T> = MergeIntersection<
  Readonly<{ next: (value: T) => void }> & TinyObservable<T>
>;

export const createTinyObservable = <T>(): TinyObservableSource<T> =>
  new TinyObservableClass<T>();

class TinyObservableClass<T> implements TinyObservableSource<T> {
  readonly #mut_subscriptions = new MutableMap<symbol, (value: T) => void>();

  next(value: T): void {
    for (const fn of this.#mut_subscriptions.values()) {
      fn(value);
    }
  }

  subscribe(fn: (value: T) => void): Subscription {
    const id = Symbol();

    this.#mut_subscriptions.set(id, fn);

    return {
      unsubscribe: () => {
        this.#mut_subscriptions.delete(id);
      },
    };
  }
}
