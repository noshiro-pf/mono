import { fromSubscribable } from 'synstate';
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test(fromSubscribable, async () => {
    // embed-sample-code-ignore-above

    //  Explanation:
    //  - fromSubscribable converts any subscribable object into a SynState Observable
    //  - Works with objects that have a subscribe(onNext, onError, onComplete) method
    //  - Wraps values in Result type for error handling
    //  - Useful for integrating with other reactive libraries or custom subscribables

    // Example: Converting a custom subscribable
    const customSubscribable = {
      subscribe: (
        onNext: (value: number) => void,
        _onError?: (error: unknown) => void,
        onComplete?: () => void,
      ) => {
        setTimeout(() => {
          onNext(1);

          onNext(2);

          onNext(3);

          onComplete?.();
        }, 0);

        return { unsubscribe: () => {} };
      },
    };

    const observable$ = fromSubscribable<number>(customSubscribable);

    const mut_history: number[] = [];

    await new Promise<void>((resolve) => {
      observable$.subscribe(
        (result) => {
          if (Result.isOk(result)) {
            mut_history.push(result.value);
          }
        },
        () => {
          resolve();
        },
      );
    });

    assert.deepStrictEqual(mut_history, [1, 2, 3]);

    // embed-sample-code-ignore-below
  });
}
