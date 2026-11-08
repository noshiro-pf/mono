import { fromSubscribable, type Subscribable } from 'synstate-next';
import { Result } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('from-subscribable', () => {
    // embed-sample-code-ignore-above
    const mut_observers: Parameters<Subscribable<number>['subscribe']>[0][] =
      [];

    // transformer-ignore-next-line append-as-const
    const external: Subscribable<number> = {
      subscribe: (observer) => {
        mut_observers.push(observer);

        return { unsubscribe: () => {} };
      },
    };

    const followed = fromSubscribable(external);

    mut_observers[0]?.next(1);

    assert.deepStrictEqual(followed.getSnapshot(), Result.ok(1));

    mut_observers[0]?.error(new Error('closed'));

    assert.isTrue(Result.isErr(followed.getSnapshot() ?? Result.ok(0)));

    // embed-sample-code-ignore-below
  });
}
