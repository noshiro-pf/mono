import { fromSubscribable, type Subscribable } from 'synstate-next';
import { Optional, Result } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('fromSubscribable', () => {
    // embed-sample-code-ignore-above
    // Anything subscribed to with an observer object: an RxJS observable, a
    // TC39 `Observable`, or this.
    // transformer-ignore-next-line append-as-const
    const words: Subscribable<string> = {
      subscribe: (observer) => {
        observer.next('hello');

        observer.next('world');

        observer.complete();

        return { unsubscribe: () => {} };
      },
    };

    const followed = fromSubscribable(words);

    // A value given while it subscribes is held from the start.
    assert.deepStrictEqual(
      followed.getSnapshot(),
      Optional.some(Result.ok('world')),
    );

    // embed-sample-code-ignore-below
  });
}
