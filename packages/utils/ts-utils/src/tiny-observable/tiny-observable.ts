import { MutableMap } from '../others';

export type Subscription = Readonly<{
  unsubscribe: () => void;
}>;

export type TinyObservable<T> = Readonly<{
  subscribe: (fn: (value: T) => void) => Subscription;
}>;
export type TinyObservableSource<T> = MergeIntersection<
  TinyObservable<T> & { readonly next: (value: T) => void }
>;

export const createTinyObservable = <T>(): TinyObservableSource<T> =>
  new TinyObservableClass<T>();

class TinyObservableClass<T> implements TinyObservableSource<T> {
  private readonly subscriptions = new MutableMap<symbol, (value: T) => void>();

  next(value: T): void {
    for (const fn of this.subscriptions.values()) {
      fn(value);
    }
  }

  subscribe(fn: (value: T) => void): Subscription {
    const id = Symbol();

    this.subscriptions.set(id, fn);

    return {
      unsubscribe: () => {
        this.subscriptions.delete(id);
      },
    };
  }
}
