import { Optional, Result } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import { fromAbortablePromise } from './from-abortable-promise.mjs';
import { fromPromise } from './from-promise.mjs';

describe('fromPromise and fromAbortablePromise report only the promise’s own rejection as an Err (#2931)', () => {
  test.each([
    ['fromPromise', () => fromPromise(Promise.resolve(1))],
    [
      'fromAbortablePromise',
      () => fromAbortablePromise(() => Promise.resolve(1)),
    ],
  ] as const)(
    '%s: a subscriber that throws on the Ok value gets no Err',
    async (_, create) => {
      vi.useFakeTimers();

      onTestFinished(() => {
        vi.useRealTimers();
      });

      const mut_events: string[] = [];

      const result$ = create();

      result$.subscribe(
        (r) => {
          mut_events.push(Result.isOk(r) ? `ok ${r.value}` : 'err');

          if (Result.isOk(r)) {
            panic('bug in a subscriber');
          }
        },
        () => {
          mut_events.push('complete');
        },
      );

      await settlePromises();

      assert.deepStrictEqual(mut_events, ['ok 1', 'complete']);

      // The subscriber's exception is not swallowed: it is thrown again from a
      // task of its own.
      expect(() => {
        vi.runOnlyPendingTimers();
      }).toThrow('bug in a subscriber');
    },
  );

  const rejection = new Error('rejected');

  test.each([
    ['fromPromise', () => fromPromise(Promise.reject(rejection))],
    [
      'fromAbortablePromise',
      () => fromAbortablePromise(() => Promise.reject(rejection)),
    ],
  ] as const)('%s: a rejection is an Err', async (_, create) => {
    const result$ = create();

    const mut_events: string[] = [];

    result$.subscribe(
      (r) => {
        mut_events.push(
          Result.isErr(r) && r.value === rejection ? 'err rejected' : 'ok',
        );
      },
      () => {
        mut_events.push('complete');
      },
    );

    await settlePromises();

    assert.deepStrictEqual(mut_events, ['err rejected', 'complete']);
  });

  test('fromPromise holds the value by the time an await of the same promise resumes', async () => {
    const promise = Promise.resolve(1);

    const result$ = fromPromise(promise);

    await promise;

    assert.deepStrictEqual(result$.getSnapshot(), Optional.some(Result.ok(1)));
  });
});

/** Lets the promise chains already started run to their end. */
const settlePromises = async (): Promise<void> => {
  for (const _ of Array.from({ length: 10 })) {
    // eslint-disable-next-line no-await-in-loop -- each await lets the chains take one more step
    await Promise.resolve();
  }
};
