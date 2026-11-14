import { createState } from 'synstate';
import { Optional, Result } from 'ts-data-forge';
import type { Answered } from '../graphql.mjs';
import type { StoredToken } from '../token.mjs';
import { dayKeyOf, type WeeklyActivity } from '../weekly-activity.mjs';
import { createActivityStore, type ActivityDeps } from './activity-store.mjs';

describe(createActivityStore, () => {
  test('reads nothing until it is opened, then reads the week', async () => {
    const { store, loads, answer } = setup();

    store.start();

    assert.strictEqual(loads.length, 0);

    store.openDialog();

    assert.isTrue(Optional.unwrap(store.open.getSnapshot()));

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).type,
      'loading',
    );

    answer(0, week(TODAY));

    await settle();

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).type,
      'ready',
    );

    assert.strictEqual(loads.length, 1);

    assert.strictEqual(loads[0]?.token, 'secret');
  });

  test('opened again on the same day, it shows what it holds while reading today again', async () => {
    const { store, loads, answer } = setup();

    store.openDialog();

    answer(0, week(TODAY, 1));

    await settle();

    store.closeDialog();

    store.openDialog();

    // Today is still going, so it is asked again; the week held stays on screen
    // meanwhile rather than "Counting…".
    assert.strictEqual(loads.length, 2);

    assert.strictEqual(todayMergedOf(store), 1);

    answer(1, week(TODAY, 3));

    await settle();

    assert.strictEqual(todayMergedOf(store), 3);
  });

  test('opened again while a read is on its way, it asks nothing more', () => {
    const { store, loads } = setup();

    store.openDialog();

    store.closeDialog();

    store.openDialog();

    assert.strictEqual(loads.length, 1);
  });

  test('opened on a later day than the week held, it reads again', async () => {
    const { store, loads, answer, setNow } = setup();

    store.openDialog();

    answer(0, week(TODAY));

    await settle();

    store.closeDialog();

    setNow(TOMORROW_MS);

    store.openDialog();

    assert.strictEqual(loads.length, 2);

    // Yesterday's week is not shown while the new one is read.
    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).type,
      'loading',
    );
  });

  test('midnight reads the new week while the dialog is open, and forgets it while closed', async () => {
    const { store, loads, answer, fireTimer, timers } = setup();

    store.start();

    // Set for the next midnight in the reader's zone.
    assert.strictEqual(timers.length, 1);

    store.openDialog();

    answer(0, week(TODAY));

    await settle();

    fireTimer();

    assert.strictEqual(loads.length, 2);

    // And set again for the midnight after.
    assert.strictEqual(timers.length, 2);

    store.closeDialog();

    fireTimer();

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).type,
      'idle',
    );

    assert.strictEqual(loads.length, 2);
  });

  test('an answer overtaken by a later read is dropped', async () => {
    const { store, answer, fireTimer } = setup();

    store.start();

    store.openDialog();

    fireTimer();

    answer(1, week(TODAY));

    await settle();

    answer(0, Result.err('stale'));

    await settle();

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).type,
      'ready',
    );
  });

  test('a failed read says why, and can be tried again', async () => {
    const { store, loads, answer } = setup();

    store.openDialog();

    answer(0, Result.err('GitHub answered 502 Bad Gateway.'));

    await settle();

    assert.deepStrictEqual(Optional.unwrap(store.status.getSnapshot()), {
      type: 'failed',
      message: 'GitHub answered 502 Bad Gateway.',
    });

    store.retry();

    assert.strictEqual(loads.length, 2);
  });

  test('a read that rejects says why, and the dialog can read again', async () => {
    const { store, loads, fail } = setup();

    store.openDialog();

    fail(0, new Error('The connection was reset.'));

    await settle();

    assert.deepStrictEqual(Optional.unwrap(store.status.getSnapshot()), {
      type: 'failed',
      message: 'The connection was reset.',
    });

    store.closeDialog();

    store.openDialog();

    assert.strictEqual(loads.length, 2);

    store.retry();

    assert.strictEqual(loads.length, 3);
  });

  test.each([[''], [undefined], [null]])(
    'a read that rejects with %o still says something',
    async (reason) => {
      const { store, fail } = setup();

      store.openDialog();

      fail(0, reason);

      await settle();

      assert.deepStrictEqual(Optional.unwrap(store.status.getSnapshot()), {
        type: 'failed',
        message: 'Could not count the week.',
      });
    },
  );

  test('a same-day read that rejects replaces the week held with why', async () => {
    const { store, answer, fail } = setup();

    store.openDialog();

    answer(0, week(TODAY));

    await settle();

    store.closeDialog();

    store.openDialog();

    fail(1, new Error('The connection was reset.'));

    await settle();

    assert.deepStrictEqual(Optional.unwrap(store.status.getSnapshot()), {
      type: 'failed',
      message: 'The connection was reset.',
    });
  });

  test('a load that throws before its promise is a failed read', async () => {
    const { store } = setup(() => {
      throw new RangeError('Invalid time value');
    });

    store.openDialog();

    await settle();

    assert.deepStrictEqual(Optional.unwrap(store.status.getSnapshot()), {
      type: 'failed',
      message: 'Invalid time value',
    });
  });

  test('a rejection overtaken by a later read is dropped', async () => {
    const { store, loads, answer, fail } = setup();

    store.openDialog();

    store.retry();

    answer(1, week(TODAY));

    fail(0, new Error('The connection was reset.'));

    await settle();

    assert.strictEqual(loads.length, 2);

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).type,
      'ready',
    );
  });

  test('with no token it says so rather than asking', () => {
    const { store, loads, setToken } = setup();

    setToken(undefined);

    store.openDialog();

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).type,
      'failed',
    );

    assert.strictEqual(loads.length, 0);
  });

  test('a new token forgets the week read with the old one', async () => {
    const { store, answer, setToken } = setup();

    store.start();

    store.openDialog();

    answer(0, week(TODAY));

    await settle();

    store.closeDialog();

    setToken({ value: 'other', store: 'session' });

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).type,
      'idle',
    );
  });
});

// 2026-10-18 22:00 in Tokyo; the store reads the day in the test's own zone,
// so these are keyed by whatever that is.
const NOW_MS = /* 2026-10-18T13:00:00Z */ 1_792_328_400_000;

const TOMORROW_MS = NOW_MS + 86_400_000;

const TODAY = 'today';

const week = (
  countedOn: string,
  todayMerged = 0,
): Answered<WeeklyActivity>['result'] =>
  Result.ok({
    days: [],
    today: {
      key: countedOn,
      startMs: 0,
      endMs: 0,
      range: '',
      merged: todayMerged,
      closed: 0,
    },
    countedOn,
    countedAtMs: NOW_MS,
  });

const todayMergedOf = (
  store: ReturnType<typeof createActivityStore>,
): number | undefined => {
  const status = Optional.unwrap(store.status.getSnapshot());

  return status.type === 'ready' ? status.activity.today.merged : undefined;
};

const cancelNothing = (): void => undefined;

/** `load` replaces the one that waits to be answered, for a load that throws. */
const setup = (
  load?: ActivityDeps['load'],
): Readonly<{
  store: ReturnType<typeof createActivityStore>;
  loads: readonly Readonly<{ token: string; nowMs: number }>[];
  answer: (index: number, result: Answered<WeeklyActivity>['result']) => void;
  /** Rejects the load, as one that throws does. */
  fail: (index: number, error: unknown) => void;
  setNow: (ms: number) => void;
  setToken: (next: StoredToken | undefined) => void;
  timers: readonly Readonly<{ delayMs: number }>[];
  fireTimer: () => void;
}> => {
  const mut_loads: {
    token: string;
    nowMs: number;
    resolve: (answered: Answered<WeeklyActivity>) => void;
    reject: (error: unknown) => void;
  }[] = [];

  const mut_timers: { delayMs: number; run: () => void }[] = [];

  const mut_clock = { nowMs: NOW_MS };

  const [storedToken, setToken] = createState<StoredToken | undefined>({
    value: 'secret',
    store: 'session',
  });

  const store = createActivityStore({
    token: storedToken,
    load:
      load ??
      (async (loadToken, nowMs) => {
        const { promise, resolve, reject } =
          Promise.withResolvers<Answered<WeeklyActivity>>();

        mut_loads.push({ token: loadToken, nowMs, resolve, reject });

        return promise;
      }),
    now: () => mut_clock.nowMs,
    setTimer: (delayMs, run) => {
      mut_timers.push({ delayMs, run });

      return cancelNothing;
    },
  });

  return {
    store,
    loads: mut_loads,
    answer: (index, result) => {
      // The week is counted on the day the store asked on, as the real one is.
      const asked = mut_loads[index];

      asked?.resolve({
        rateLimit: undefined,
        result: Result.isOk(result)
          ? Result.ok({ ...result.value, countedOn: dayKeyOf(asked.nowMs) })
          : result,
      });
    },
    fail: (index, error) => {
      mut_loads[index]?.reject(error);
    },
    setNow: (ms) => {
      mut_clock.nowMs = ms;
    },
    setToken,
    timers: mut_timers,
    fireTimer: () => {
      mut_timers.at(-1)?.run();
    },
  };
};

const settle = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};
