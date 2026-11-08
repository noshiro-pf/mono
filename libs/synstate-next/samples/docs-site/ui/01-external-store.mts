import {
  createState,
  map,
  type InitializedObservable,
  type Unsubscribe,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('an external store', () => {
    // embed-sample-code-ignore-above
    // What React's `useSyncExternalStore` and similar hooks take.
    type ExternalStore<A> = Readonly<{
      subscribe: (onStoreChange: () => void) => Unsubscribe;
      getSnapshot: () => A;
    }>;

    const toExternalStore = <A,>(
      observable: InitializedObservable<A>,
    ): ExternalStore<A> => {
      // transformer-ignore-next-line append-as-const
      const store: ExternalStore<A> = {
        subscribe: (onStoreChange) =>
          observable.subscribe(() => {
            onStoreChange();
          }),
        getSnapshot: () => observable.value,
      };

      return store;
    };

    const [count, setCount] = createState(0);

    const label = toExternalStore(count.pipe(map((n) => `count: ${n}`)));

    // In a React component:
    // const text = useSyncExternalStore(label.subscribe, label.getSnapshot);

    let mut_changes = 0;

    const unsubscribe = label.subscribe(() => {
      mut_changes += 1;
    });

    setCount(1);

    assert.strictEqual(label.getSnapshot(), 'count: 1');

    unsubscribe();

    // Called once at subscription, once for the change.
    assert.strictEqual(mut_changes, 2);

    // embed-sample-code-ignore-below
  });
}
