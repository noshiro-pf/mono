export type Subscription = Readonly<{
  unsubscribe: () => void;
}>;

export class TinyObservable<T> {
  private readonly subscriptions = new Map<symbol, (value: T) => void>();

  next(value: T): void {
    this.subscriptions.forEach((fn) => {
      fn(value);
    });
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
