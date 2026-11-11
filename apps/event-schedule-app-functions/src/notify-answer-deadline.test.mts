import {
  EventSchedule,
  firestorePaths,
  NotificationSettings,
} from 'event-schedule-app-shared';
import type { DocumentData, Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';
import { Arr, asSafeUint } from 'ts-data-forge';
import type { Ymdhm } from 'ts-fortress-types';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import { getFirebaseConfig } from './env.mjs';
import { notifyAfterAnswerDeadline } from './notify-answer-deadline.mjs';
import { sendEmail } from './setup-mailer.mjs';

vi.mock(import('firebase-functions/v1'), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    logger: {
      ...original.logger,
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
    },
  };
});

vi.mock(import('./env.mjs'), async (importOriginal) => ({
  ...(await importOriginal()),
  getFirebaseConfig: vi.fn(),
}));

vi.mock(import('./setup-mailer.mjs'), async (importOriginal) => ({
  ...(await importOriginal()),
  sendEmail: vi.fn(() => Promise.resolve()),
}));

type FakeSnapshot = Readonly<{ data: () => DocumentData | undefined }>;

type FakeDoc = Readonly<{
  id: string;
  path: string;
  get: () => Promise<FakeSnapshot>;
  collection: (name: string) => Readonly<{ doc: (id: string) => FakeDoc }>;
}>;

type NextTransaction =
  | 'repeat'
  | 'reject'
  | (() => void)
  | Readonly<{ repeatAfter?: () => void; afterCommit?: () => void }>;

type FakeTransaction = Readonly<{
  get: (ref: FakeDoc) => Promise<FakeSnapshot>;
  getAll: (...refs: readonly FakeDoc[]) => Promise<readonly FakeSnapshot[]>;
  set: (ref: FakeDoc, data: DeepReadonly<DocumentData>) => void;
  delete: (ref: FakeDoc) => void;
}>;

/**
 * As much of the Admin SDK's `Firestore` as `notifyAfterAnswerDeadline` uses,
 * over a map from document path to data.
 *
 * A transaction's writes are applied when its function returns, and a read
 * after a write is refused, as the SDK refuses it. Transactions run one after
 * another, which is what the locks a real one takes on the documents it read
 * amount to for two that read the same document; contention between documents
 * is not modelled.
 */
const createFakeFirestore = (
  initial: DeepReadonly<ReadonlyRecord<string, DocumentData>>,
): {
  readonly db: Firestore;
  mut_docs: Map<string, DocumentData>;
  /** The path of each document read, in order, the events query aside. */
  readonly reads: readonly string[];
  /**
   * What the next transaction does besides running its function and applying
   * its writes:
   *
   * - `'repeat'`: runs the function a second time afterwards, as the SDK does
   *   for a commit that went through and was reported as failed, and
   *   `repeatAfter` calls a function between the two;
   * - `'reject'`: rejects after applying the writes, as the SDK does when it
   *   gives such a commit up;
   * - a function: calls it first, for a write made between a run's query and
   *   its transaction;
   * - `afterCommit`: calls it once the writes are applied, for time that passes
   *   in the commit.
   */
  readonly onNextTransaction: (what: NextTransaction) => void;
} => {
  const mut_docs = new Map<string, DocumentData>(Object.entries(initial));

  const mut_reads: string[] = [];

  const mut_state: { next: NextTransaction | undefined } = { next: undefined };

  const snapshot = (path: string): FakeSnapshot => {
    mut_reads.push(path);

    const data = mut_docs.get(path);

    return { data: () => data };
  };

  const docRef = (path: string): FakeDoc =>
    ({
      id: path.slice(path.lastIndexOf('/') + 1),
      path,
      get: () => Promise.resolve(snapshot(path)),
      collection: (name) => ({ doc: (id) => docRef(`${path}/${name}/${id}`) }),
    }) as const;

  /** Runs the function once and applies its writes. */
  const attempt = async <R,>(
    update: (tx: FakeTransaction) => Promise<R>,
  ): Promise<R> => {
    const mut_writes: (() => void)[] = [];

    const read = (ref: FakeDoc): Promise<FakeSnapshot> =>
      Arr.isEmpty(mut_writes)
        ? Promise.resolve(snapshot(ref.path))
        : Promise.reject(new Error('A transaction reads before it writes.'));

    const result = await update({
      get: read,
      getAll: (...refs) => Promise.all(refs.map(read)),
      set: (ref, data) => {
        mut_writes.push(() => {
          mut_docs.set(ref.path, data);
        });
      },
      delete: (ref) => {
        mut_writes.push(() => {
          mut_docs.delete(ref.path);
        });
      },
    });

    for (const write of mut_writes) {
      write();
    }

    return result;
  };

  let mut_lastTransaction: Promise<unknown> = Promise.resolve();

  const fake = {
    collection: (name: string) => ({
      // The one query made is for the events with notifications on, which every
      // event of these tests has.
      where: () => ({
        get: () =>
          Promise.resolve({
            docs: Array.from(mut_docs)
              .filter(([path]) => Arr.isFixedLengthArray(2, path.split('/')))
              .map(([path, data]) => ({
                id: path.slice(name.length + 1),
                ref: docRef(path),
                data: () => data,
              })),
          }),
      }),
    }),
    getAll: (...refs: readonly FakeDoc[]) =>
      Promise.resolve(refs.map((ref) => snapshot(ref.path))),
    runTransaction: <R,>(
      update: (tx: FakeTransaction) => Promise<R>,
    ): Promise<R> => {
      const result = mut_lastTransaction.then(async () => {
        const next = mut_state.next;

        mut_state.next = undefined;

        if (next === 'repeat' || next === 'reject') {
          await attempt(update);
        } else if (typeof next === 'function') {
          next();
        } else if (typeof next === 'object' && next.repeatAfter !== undefined) {
          await attempt(update);

          next.repeatAfter();
        }

        if (next === 'reject') {
          throw new Error('The commit was reported as failed.');
        }

        const committed = await attempt(update);

        if (typeof next === 'object') {
          next.afterCommit?.();
        }

        return committed;
      });

      mut_lastTransaction = result.catch(() => undefined);

      return result;
    },
  } as const;

  return {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a fake of the few members used
    db: fake as unknown as Firestore,
    mut_docs,
    reads: mut_reads,
    onNextTransaction: (what) => {
      mut_state.next = what;
    },
  };
};

const eventPath = (eventId: string): string =>
  `${firestorePaths.events}/${eventId}` as const;

const emailPath = (eventId: string): string =>
  `${eventPath(eventId)}/${firestorePaths.internal}/${firestorePaths.values}` as const;

const markPath = (eventId: string): string =>
  `${eventPath(eventId)}/${firestorePaths.internal}/${firestorePaths.closingMail}` as const;

const deadlineAt = (hours: Ymdhm['hours'], minutes: Ymdhm['minutes']): Ymdhm =>
  ({
    year: asSafeUint(2026),
    month: 11,
    date: 1,
    hours,
    minutes,
  }) as const;

/** An event made in UTC whose author is mailed once its answers close. */
const eventClosingAt = (
  answerDeadline: Ymdhm | 'none',
  notifyAfter: boolean = true,
): EventSchedule =>
  EventSchedule.fill({
    title: 'Party',
    answerDeadline,
    timezoneOffsetMinutes: 0,
    notificationSettings: NotificationSettings.fill({
      notifyAfterAnswerDeadline: notifyAfter,
    }),
  });

/** One event, `e1`, closing at 23:05, with its author's email. */
const oneEvent = (): ReadonlyRecord<string, DocumentData> =>
  ({
    [eventPath('e1')]: eventClosingAt(deadlineAt(23, 5)),
    [emailPath('e1')]: { email: 'author@example.com' },
  }) as const;

const at = (time: string): number => Date.parse(`2026-11-${time}:00Z`);

const sentTo = (): readonly string[] =>
  vi.mocked(sendEmail).mock.calls.map(([options]) => options.to);

describe(notifyAfterAnswerDeadline, () => {
  beforeEach(() => {
    vi.mocked(sendEmail).mockReset();

    vi.mocked(sendEmail).mockResolvedValue(undefined);

    vi.mocked(logger.error).mockClear();

    vi.mocked(logger.warn).mockClear();

    vi.mocked(getFirebaseConfig).mockReturnValue({
      gmail: {
        email: 'from@example.com',
        password: 'password',
        'app-password': 'password',
        'email-address-for-error-log': 'log@example.com',
      },
    });
  });

  test('mails the author once the deadline has passed, and not before', async () => {
    const { db, mut_docs } = createFakeFirestore(oneEvent());

    await notifyAfterAnswerDeadline(db, at('01T23:00'));

    assert.deepStrictEqual(sentTo(), []);

    assert.isFalse(mut_docs.has(markPath('e1')));

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);

    assert.strictEqual(
      vi.mocked(sendEmail).mock.calls[0]?.[0].subject,
      'イベント「Party」の回答を締め切りました。',
    );

    assert.strictEqual(
      mut_docs.get(markPath('e1'))?.['deadlineMillis'],
      at('01T23:05'),
    );
  });

  test('a run repeated with the same time sends one mail', async () => {
    const { db } = createFakeFirestore(oneEvent());

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);
  });

  test('two deliveries of a run at once send one mail', async () => {
    const { db } = createFakeFirestore(oneEvent());

    await Promise.all([
      notifyAfterAnswerDeadline(db, at('01T23:10')),
      notifyAfterAnswerDeadline(db, at('01T23:10')),
    ]);

    assert.deepStrictEqual(sentTo(), ['author@example.com']);
  });

  test('the run after a skipped one sends the mail, and the ones after it do not', async () => {
    const { db } = createFakeFirestore(oneEvent());

    // The run at 23:10 did not happen.
    await notifyAfterAnswerDeadline(db, at('01T23:20'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);

    await notifyAfterAnswerDeadline(db, at('01T23:30'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);
  });

  test('catches up a deadline that passed up to 24 hours before, and none older', async () => {
    const late = createFakeFirestore(oneEvent());

    await notifyAfterAnswerDeadline(late.db, at('02T23:00'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);

    vi.mocked(sendEmail).mockClear();

    const tooLate = createFakeFirestore(oneEvent());

    await notifyAfterAnswerDeadline(tooLate.db, at('02T23:05'));

    assert.deepStrictEqual(sentTo(), []);

    // An event out of the bound costs no read of its own.
    assert.deepStrictEqual(tooLate.reads, []);
  });

  test('a deadline moved after its mail gets the mail again when it passes', async () => {
    const { db, mut_docs } = createFakeFirestore(oneEvent());

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    mut_docs.set(eventPath('e1'), eventClosingAt(deadlineAt(23, 45)));

    await notifyAfterAnswerDeadline(db, at('01T23:20'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);

    await notifyAfterAnswerDeadline(db, at('01T23:50'));

    await notifyAfterAnswerDeadline(db, at('02T00:00'));

    assert.deepStrictEqual(sentTo(), [
      'author@example.com',
      'author@example.com',
    ]);

    assert.strictEqual(
      mut_docs.get(markPath('e1'))?.['deadlineMillis'],
      at('01T23:45'),
    );
  });

  test('a send that fails rejects the run, and the next run sends the mail', async () => {
    const { db, mut_docs } = createFakeFirestore(oneEvent());

    vi.mocked(sendEmail).mockRejectedValueOnce(new Error('smtp is down'));

    await expect(notifyAfterAnswerDeadline(db, at('01T23:10'))).rejects.toThrow(
      '1 of the 1 closing mails tried failed.',
    );

    assert.isFalse(mut_docs.has(markPath('e1')));

    await notifyAfterAnswerDeadline(db, at('01T23:20'));

    assert.deepStrictEqual(sentTo(), [
      'author@example.com',
      'author@example.com',
    ]);

    assert.isTrue(mut_docs.has(markPath('e1')));
  });

  test('a failed send for a moved deadline leaves no mark, not the earlier one', async () => {
    const { db, mut_docs } = createFakeFirestore({
      ...oneEvent(),
      [markPath('e1')]: { deadlineMillis: at('01T22:00'), claimId: 'earlier' },
    });

    vi.mocked(sendEmail).mockRejectedValueOnce(new Error('smtp is down'));

    await expect(notifyAfterAnswerDeadline(db, at('01T23:10'))).rejects.toThrow(
      '1 of the 1 closing mails tried failed.',
    );

    assert.isFalse(mut_docs.has(markPath('e1')));
  });

  test('a failed send is logged with its reason', async () => {
    const { db } = createFakeFirestore(oneEvent());

    const reason = new Error('smtp is down');

    vi.mocked(sendEmail).mockRejectedValueOnce(reason);

    await expect(notifyAfterAnswerDeadline(db, at('01T23:10'))).rejects.toThrow(
      '1 of the 1 closing mails tried failed.',
    );

    assert.deepStrictEqual(vi.mocked(logger.error).mock.calls, [
      ['The closing mail of the event e1 was not sent.', reason],
    ]);
  });

  test('a mark whose commit was reported as failed is still mailed', async () => {
    const { db, onNextTransaction } = createFakeFirestore(oneEvent());

    onNextTransaction('repeat');

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);

    await notifyAfterAnswerDeadline(db, at('01T23:20'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);
  });

  test('a mark whose commit was reported as failed is removed when the event stopped asking for the mail', async () => {
    const { db, mut_docs, onNextTransaction } = createFakeFirestore(oneEvent());

    onNextTransaction({
      repeatAfter: () => {
        mut_docs.set(eventPath('e1'), eventClosingAt(deadlineAt(23, 5), false));
      },
    });

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), []);

    assert.isFalse(mut_docs.has(markPath('e1')));
  });

  test('a send that hangs is given up, and the next run sends the mail', async () => {
    vi.useFakeTimers();

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { db, mut_docs } = createFakeFirestore(oneEvent());

    vi.mocked(sendEmail).mockReturnValueOnce(new Promise(() => {}));

    const run = expect(
      notifyAfterAnswerDeadline(db, at('01T23:10')),
    ).rejects.toThrow('1 of the 1 closing mails tried failed.');

    await vi.advanceTimersByTimeAsync(30_000);

    await run;

    assert.isFalse(mut_docs.has(markPath('e1')));

    await notifyAfterAnswerDeadline(db, at('01T23:20'));

    assert.isTrue(mut_docs.has(markPath('e1')));
  });

  test.each([
    [59_999, ['author@example.com'], []],
    [
      60_000,
      [],
      [['Out of time: 1 of the 1 closing mails are left to the next run.']],
    ],
  ] as const)(
    'an event reached %i ms into the run is marked and sent only if a whole send still fits',
    async (readMillis, sent, warnings) => {
      vi.useFakeTimers();

      onTestFinished(() => {
        vi.useRealTimers();
      });

      const { db, mut_docs, onNextTransaction } =
        createFakeFirestore(oneEvent());

      onNextTransaction(() => {
        vi.advanceTimersByTime(readMillis);
      });

      // Out of time is not a failure: the run resolves.
      await notifyAfterAnswerDeadline(db, at('01T23:10'));

      assert.deepStrictEqual(sentTo(), sent);

      assert.strictEqual(mut_docs.has(markPath('e1')), Arr.isNonEmpty(sent));

      assert.deepStrictEqual<readonly unknown[]>(
        vi.mocked(logger.warn).mock.calls,
        warnings,
      );
    },
  );

  test('a mark whose commit was reported as failed is removed when the run has run out of time since', async () => {
    vi.useFakeTimers();

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { db, mut_docs, onNextTransaction } = createFakeFirestore(oneEvent());

    onNextTransaction({
      repeatAfter: () => {
        vi.advanceTimersByTime(80_000);
      },
    });

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), []);

    assert.isFalse(mut_docs.has(markPath('e1')));

    await notifyAfterAnswerDeadline(db, at('01T23:20'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);
  });

  test('an event whose commit ends too late in the run for a whole send is not sent, and its mark is removed', async () => {
    vi.useFakeTimers();

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { db, mut_docs, onNextTransaction } = createFakeFirestore(oneEvent());

    onNextTransaction({
      afterCommit: () => {
        vi.advanceTimersByTime(60_000);
      },
    });

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), []);

    assert.isFalse(mut_docs.has(markPath('e1')));

    assert.deepStrictEqual(vi.mocked(logger.warn).mock.calls, [
      ['Out of time: 1 of the 1 closing mails are left to the next run.'],
    ]);
  });

  test('a run out of time leaves the remaining events, unmarked and unread, to the next run', async () => {
    vi.useFakeTimers();

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { db, mut_docs, reads } = createFakeFirestore({
      ...oneEvent(),
      [eventPath('e2')]: eventClosingAt(deadlineAt(23, 0)),
      [emailPath('e2')]: { email: 'other@example.com' },
    });

    // The first send takes the run past the time in which it starts another.
    vi.mocked(sendEmail).mockImplementationOnce(() => {
      vi.advanceTimersByTime(60_000);

      return Promise.resolve();
    });

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);

    assert.isFalse(mut_docs.has(markPath('e2')));

    // Whatever it would have found: the loop stops before the event's own reads.
    assert.isFalse(reads.includes(eventPath('e2')));

    assert.deepStrictEqual(vi.mocked(logger.warn).mock.calls, [
      ['Out of time: 1 of the 2 closing mails are left to the next run.'],
    ]);

    await notifyAfterAnswerDeadline(db, at('01T23:20'));

    assert.deepStrictEqual(sentTo(), [
      'author@example.com',
      'other@example.com',
    ]);
  });

  test('a mark whose transaction rejected is removed, and the next run sends the mail', async () => {
    const { db, mut_docs, onNextTransaction } = createFakeFirestore(oneEvent());

    onNextTransaction('reject');

    await expect(notifyAfterAnswerDeadline(db, at('01T23:10'))).rejects.toThrow(
      '1 of the 1 closing mails tried failed.',
    );

    assert.deepStrictEqual(sentTo(), []);

    assert.isFalse(mut_docs.has(markPath('e1')));

    assert.strictEqual(vi.mocked(logger.error).mock.calls.length, 1);

    await notifyAfterAnswerDeadline(db, at('01T23:20'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);
  });

  test.each([
    ['moved to a time still ahead', eventClosingAt(deadlineAt(23, 45))],
    ['no longer asking for the mail', eventClosingAt(deadlineAt(23, 5), false)],
  ] as const)(
    'an event edited after the run read it, %s, is neither mailed nor marked',
    async (_, edited) => {
      const { db, mut_docs, onNextTransaction } =
        createFakeFirestore(oneEvent());

      onNextTransaction(() => {
        mut_docs.set(eventPath('e1'), edited);
      });

      await notifyAfterAnswerDeadline(db, at('01T23:10'));

      assert.deepStrictEqual(sentTo(), []);

      assert.isFalse(mut_docs.has(markPath('e1')));
    },
  );

  test('an event whose deadline moved, after the run read it, to another time that has passed is mailed for that one', async () => {
    const { db, mut_docs, onNextTransaction } = createFakeFirestore(oneEvent());

    onNextTransaction(() => {
      mut_docs.set(eventPath('e1'), eventClosingAt(deadlineAt(23, 0)));
    });

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);

    assert.strictEqual(
      mut_docs.get(markPath('e1'))?.['deadlineMillis'],
      at('01T23:00'),
    );
  });

  test('the mail carries the title the event has when it is marked', async () => {
    const { db, mut_docs, onNextTransaction } = createFakeFirestore(oneEvent());

    onNextTransaction(() => {
      mut_docs.set(eventPath('e1'), {
        ...eventClosingAt(deadlineAt(23, 5)),
        title: 'Picnic',
      });
    });

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.strictEqual(
      vi.mocked(sendEmail).mock.calls[0]?.[0].subject,
      'イベント「Picnic」の回答を締め切りました。',
    );
  });

  test('one failed send does not keep the other events from their mail', async () => {
    const { db, mut_docs } = createFakeFirestore({
      ...oneEvent(),
      [eventPath('e2')]: eventClosingAt(deadlineAt(23, 0)),
      [emailPath('e2')]: { email: 'other@example.com' },
    });

    vi.mocked(sendEmail).mockImplementation((options) =>
      options.to === 'author@example.com'
        ? Promise.reject(new Error('smtp is down'))
        : Promise.resolve(),
    );

    await expect(notifyAfterAnswerDeadline(db, at('01T23:10'))).rejects.toThrow(
      '1 of the 2 closing mails tried failed.',
    );

    assert.isFalse(mut_docs.has(markPath('e1')));

    assert.isTrue(mut_docs.has(markPath('e2')));
  });

  test('an event with no email is neither mailed nor marked, and is mailed once it has one', async () => {
    const { db, mut_docs } = createFakeFirestore({
      [eventPath('e1')]: eventClosingAt(deadlineAt(23, 5)),
    });

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), []);

    assert.isFalse(mut_docs.has(markPath('e1')));

    mut_docs.set(emailPath('e1'), { email: 'author@example.com' });

    await notifyAfterAnswerDeadline(db, at('01T23:20'));

    assert.deepStrictEqual(sentTo(), ['author@example.com']);
  });

  test('an event that does not ask for the mail, or has no deadline, is not read', async () => {
    const { db, reads } = createFakeFirestore({
      [eventPath('off')]: eventClosingAt(deadlineAt(23, 5), false),
      [emailPath('off')]: { email: 'author@example.com' },
      [eventPath('open')]: eventClosingAt('none'),
      [emailPath('open')]: { email: 'author@example.com' },
    });

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), []);

    assert.deepStrictEqual(reads, []);
  });

  test('an event already mailed costs one read a run: its mark', async () => {
    const { db, reads } = createFakeFirestore({
      ...oneEvent(),
      [markPath('e1')]: { deadlineMillis: at('01T23:05'), claimId: 'earlier' },
    });

    await notifyAfterAnswerDeadline(db, at('01T23:10'));

    assert.deepStrictEqual(sentTo(), []);

    assert.deepStrictEqual(reads, [markPath('e1')]);
  });
});
