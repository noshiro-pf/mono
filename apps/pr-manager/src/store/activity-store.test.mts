import { createState } from 'synstate';
import { Result } from 'ts-data-forge';
import type { Answered } from '../graphql.mjs';
import type { StoredToken } from '../token.mjs';
import { dayKeyOf, type WeeklyActivity } from '../weekly-activity.mjs';
import { createActivityStore } from './activity-store.mjs';

describe(createActivityStore, () => {
  test('reads nothing until it is opened, then reads the week', async () => {
    const { store, loads, answer } = setup();

    store.start();

    assert.strictEqual(loads.length, 0);

    store.openDialog();

    assert.isTrue(store.open.getSnapshot().value);

    assert.strictEqual(store.status.getSnapshot().value.type, 'loading');

    answer(0, week(TODAY));

    await settle();

    assert.strictEqual(store.status.getSnapshot().value.type, 'ready');

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

    // Today is still going, so it is asked again; the week held stays on
    // screen meanwhile rather than "Counting…".
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
    assert.strictEqual(store.status.getSnapshot().value.type, 'loading');
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

    assert.strictEqual(store.status.getSnapshot().value.type, 'idle');

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

    assert.strictEqual(store.status.getSnapshot().value.type, 'ready');
  });

  test('a failed read says why, and can be tried again', async () => {
    const { store, loads, answer } = setup();

    store.openDialog();

    answer(0, Result.err('GitHub answered 502 Bad Gateway.'));

    await settle();

    assert.deepStrictEqual(store.status.getSnapshot().value, {
      type: 'failed',
      message: 'GitHub answered 502 Bad Gateway.',
    });

    store.retry();

    assert.strictEqual(loads.length, 2);
  });

  test('with no token it says so rather than asking', () => {
    const { store, loads, setToken } = setup();

    setToken(undefined);

    store.openDialog();

    assert.strictEqual(store.status.getSnapshot().value.type, 'failed');

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

    assert.strictEqual(store.status.getSnapshot().value.type, 'idle');
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
  const status = store.status.getSnapshot().value;

  return status.type === 'ready' ? status.activity.today.merged : undefined;
};

const cancelNothing = (): void => undefined;

const setup = (): Readonly<{
  store: ReturnType<typeof createActivityStore>;
  loads: readonly Readonly<{ token: string; nowMs: number }>[];
  answer: (index: number, result: Answered<WeeklyActivity>['result']) => void;
  setNow: (ms: number) => void;
  setToken: (next: StoredToken | undefined) => void;
  timers: readonly Readonly<{ delayMs: number }>[];
  fireTimer: () => void;
}> => {
  const mut_loads: {
    token: string;
    nowMs: number;
    resolve: (answered: Answered<WeeklyActivity>) => void;
  }[] = [];

  const mut_timers: { delayMs: number; run: () => void }[] = [];

  const mut_clock = { nowMs: NOW_MS };

  const [storedToken, setToken] = createState<StoredToken | undefined>({
    value: 'secret',
    store: 'session',
  });

  const store = createActivityStore({
    token: storedToken,
    load: async (loadToken, nowMs) => {
      const { promise, resolve } =
        Promise.withResolvers<Answered<WeeklyActivity>>();

      mut_loads.push({ token: loadToken, nowMs, resolve });

      return promise;
    },
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
