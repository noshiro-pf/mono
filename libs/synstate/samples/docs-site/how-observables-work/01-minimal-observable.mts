type Subscription = Readonly<{ unsubscribe: () => void }>;

type MiniObservable<A> = Readonly<{
  subscribe: (onNext: (value: A) => void) => Subscription;
  next: (value: A) => void;
}>;

const createObservable = <A,>(): MiniObservable<A> => {
  // The whole "reactive machinery": a list of functions.
  const mut_subscribers = new Set<(value: A) => void>();

  return {
    subscribe: (onNext) => {
      mut_subscribers.add(onNext); // Remember the function. That's all.

      return {
        unsubscribe: () => {
          mut_subscribers.delete(onNext);
        },
      };
    },

    next: (value) => {
      // Call every registered function, right here, synchronously.
      for (const onNext of mut_subscribers) {
        onNext(value);
      }
    },
  };
};

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('minimal-observable', () => {
    // embed-sample-code-ignore-above
    const count = createObservable<number>();

    // A derived value is one more registered function that calls `next`.
    const doubled = createObservable<number>();

    count.subscribe((n) => {
      doubled.next(n * 2);
    });

    const mut_log: string[] = [];

    const subscription = doubled.subscribe((n) => {
      mut_log.push(`doubled: ${n}`);
    });

    mut_log.push('before next');

    count.next(1);

    mut_log.push('after next');

    // The subscriber ran inside `count.next(1)`, before it returned.
    assert.deepStrictEqual(mut_log, [
      'before next',
      'doubled: 2',
      'after next',
    ]);

    subscription.unsubscribe();

    count.next(2);

    // Removed from the list, so never called again.
    assert.deepStrictEqual(mut_log, [
      'before next',
      'doubled: 2',
      'after next',
    ]);
    // embed-sample-code-ignore-below
  });
}

export {};
