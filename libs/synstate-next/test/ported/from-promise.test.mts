/**
 * Ported from synstate's `src/core/create/from-promise.test.mts` (#2931):
 * only the promise's own rejection is an `err`. Completion is `settled` here.
 */
import { fromAbortablePromise, fromPromise } from 'synstate-next';
import { toNode } from 'synstate-next/internal';
import { Optional, Result } from 'ts-std-forge';

describe('fromPromise and fromAbortablePromise', () => {
  test.each([
    ['fromPromise', () => fromPromise(Promise.resolve(1))],
    [
      'fromAbortablePromise',
      () => fromAbortablePromise(() => Promise.resolve(1)),
    ],
  ] as const)(
    '%s: a subscriber that throws on the ok value gets no err, and its exception is thrown again',
    async (_, create) => {
      vi.useFakeTimers();

      onTestFinished(() => {
        vi.useRealTimers();
      });

      const mut_events: string[] = [];

      const result = create();

      result.subscribe((r) => {
        mut_events.push(Result.isOk(r) ? `ok ${r.value}` : 'err');

        if (Result.isOk(r)) {
          throw new Error('bug in a subscriber');
        }
      });

      await settlePromises();

      assert.deepStrictEqual(mut_events, ['ok 1']);

      assert.isTrue(toNode(result).settled);

      // Not swallowed: it is thrown again from a task of its own.
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
  ] as const)('%s: a rejection is an err', async (_, create) => {
    const result = create();

    const mut_events: unknown[] = [];

    result.subscribe((r) => {
      mut_events.push(r);
    });

    await settlePromises();

    assert.deepStrictEqual(mut_events, [Result.err(rejection)]);

    assert.isTrue(toNode(result).settled);
  });

  test('fromPromise holds the value by the time an await of the same promise resumes', async () => {
    const promise = Promise.resolve(1);

    const result = fromPromise(promise);

    await promise;

    assert.deepStrictEqual(result.getSnapshot(), Optional.some(Result.ok(1)));
  });
});

/** Lets the promise chains already started run to their end. */
const settlePromises = async (): Promise<void> => {
  for (const _ of Array.from({ length: 10 })) {
    // eslint-disable-next-line no-await-in-loop -- each await lets the chains take one more step
    await Promise.resolve();
  }
};
