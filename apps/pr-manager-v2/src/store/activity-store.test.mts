import { createState } from 'synstate';
import { Optional, Result } from 'ts-data-forge';
import {
  nextMidnightMs,
  todayOf,
  weekBefore,
  type WeeklyActivity,
} from '../domain/index.mjs';
import type { StoredToken } from '../github/index.mjs';
import { createActivityStore, type ReadActivity } from './activity-store.mjs';
import { manualTimers } from './timers.mjs';

describe(createActivityStore, () => {
  test('reads only when opened, and again on each opening', async () => {
    const { store, reads } = setup((_, nowMs) =>
      Promise.resolve(Result.ok(activityAt(nowMs))),
    );

    await flush();

    assert.strictEqual(reads(), 0);

    store.openDialog();

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).kind,
      'loading',
    );

    await flush();

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).kind,
      'ready',
    );

    store.closeDialog();

    store.openDialog();

    // The same day: the week stays on screen while today is read again.
    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).kind,
      'ready',
    );

    await flush();

    assert.strictEqual(reads(), 2);
  });

  test('says why a read failed, and a throw is a failure too', async () => {
    const { store } = setup(() => {
      throw new Error('boom');
    });

    store.openDialog();

    await flush();

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).kind,
      'failed',
    );
  });

  test('forgets the week at midnight while closed, and rereads while open', async () => {
    const { store, timers, reads } = setup((_, nowMs) =>
      Promise.resolve(Result.ok(activityAt(nowMs))),
    );

    store.openDialog();

    await flush();

    store.closeDialog();

    timers.advance(nextMidnightMs(START) - START);

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).kind,
      'idle',
    );

    store.openDialog();

    await flush();

    timers.advance(DAY_MS);

    await flush();

    assert.strictEqual(reads(), 3);

    assert.strictEqual(
      Optional.unwrap(store.status.getSnapshot()).kind,
      'ready',
    );
  });

  test('drops an answer a newer read overtook', async () => {
    const mut_answers: ((a: WeeklyActivity) => void)[] = [];

    const { store, timers } = setup(
      async () =>
        new Promise((resolve) => {
          mut_answers.push((a) => {
            resolve(Result.ok(a));
          });
        }),
    );

    store.openDialog();

    store.retry();

    mut_answers[1]?.(activityAt(timers.now() + 1));

    await flush();

    mut_answers[0]?.(activityAt(timers.now()));

    await flush();

    const status = Optional.unwrap(store.status.getSnapshot());

    assert.strictEqual(
      status.kind === 'ready' ? status.activity.countedAtMs : undefined,
      START + 1,
    );
  });
});

const START = Date.parse('2026-11-10T12:00:00Z');

const DAY_MS = 86_400_000;

const TOKEN: StoredToken = { value: 't', place: 'session' } as const;

const activityAt = (nowMs: number): WeeklyActivity =>
  ({
    days: weekBefore(nowMs).map((day) => ({ ...day, merged: 1, closed: 2 })),
    today: { ...todayOf(nowMs), merged: 0, closed: 0 },
    countedAtMs: nowMs,
  }) as const;

const flush = async (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const setup = (
  read: ReadActivity,
): Readonly<{
  store: ReturnType<typeof createActivityStore>;
  timers: ReturnType<typeof manualTimers>;
  reads: () => number;
}> => {
  const timers = manualTimers(START);

  const [token] = createState<StoredToken | undefined>(TOKEN);

  const mut_count = { reads: 0 };

  const store = createActivityStore({
    token,
    timers,
    read: async (value, nowMs) => {
      mut_count.reads += 1;

      return read(value, nowMs);
    },
  });

  store.start();

  return { store, timers, reads: () => mut_count.reads };
};
