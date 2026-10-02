import { createState, source, type SourceObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import { CLOCK_TICK_MS, POLL_INTERVAL_MS } from '../constants.mjs';
import { type Answered } from '../graphql.mjs';
import { type LoadedReport, type Merged } from '../load-report.mjs';
import { LOADING, READY, type LoadStatus } from '../load-state.mjs';
import { type RateLimit } from '../rate-limit.mjs';
import { type StoredToken } from '../token.mjs';
import { createReader, type Reader } from './reader.mjs';

describe(createReader, () => {
  test('reads nothing without a token', () => {
    const { reader, loads } = setup(undefined);

    reader.start();

    assert.deepStrictEqual(loads, []);

    assert.deepStrictEqual(reader.loadStatus.getSnapshot().value, LOADING);
  });

  test('reads at once with a token, and shows what it answers', async () => {
    const { reader, loads, clock } = setup(TOKEN_A);

    reader.start();

    assert.deepStrictEqual(
      loads.map((l) => l.token),
      ['a'],
    );

    clock.set(1_500);

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    assert.deepStrictEqual(shown(reader), { status: READY, readAt: 1_000 });

    assert.deepStrictEqual(reader.rateLimit.getSnapshot().value, LIMIT);

    assert.strictEqual(reader.nowMs.getSnapshot().value, 1_500);
  });

  test('keeps the last rate limit when an answer carries none', async () => {
    const { reader, loads, timers } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    timers.fire(POLL_INTERVAL_MS);

    await answer(loads, 1, Result.err('network'), undefined);

    assert.deepStrictEqual(reader.rateLimit.getSnapshot().value, LIMIT);
  });

  test('polls while the tab is visible, and not while it is hidden', () => {
    const { reader, loads, timers, visibility } = setup(TOKEN_A);

    reader.start();

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 2);

    visibility.set(false);

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 2);
  });

  test('reads, and moves the clock, when a hidden tab comes back', () => {
    const { reader, loads, clock, visibility } = setup(TOKEN_A);

    reader.start();

    visibility.set(false);

    visibility.change();

    assert.strictEqual(loads.length, 1);

    clock.set(9_000);

    visibility.set(true);

    visibility.change();

    assert.strictEqual(loads.length, 2);

    assert.strictEqual(reader.nowMs.getSnapshot().value, 9_000);
  });

  test('moves the clock on its own timer', () => {
    const { reader, clock, timers } = setup(undefined);

    reader.start();

    clock.set(42_000);

    timers.fire(CLOCK_TICK_MS);

    assert.strictEqual(reader.nowMs.getSnapshot().value, 42_000);
  });

  test('leaves the clock alone while the tab is hidden', () => {
    const { reader, clock, timers, visibility } = setup(undefined);

    reader.start();

    visibility.set(false);

    clock.set(42_000);

    timers.fire(CLOCK_TICK_MS);

    assert.strictEqual(reader.nowMs.getSnapshot().value, 0);
  });

  // A poll answers every fifteen seconds whether or not anything changed.
  // What it writes is only what changed, so nothing drawn from the rest is
  // told anything, let alone handed a new object.
  test('a read that answers the same writes the time of reading and nothing else', async () => {
    const { reader, loads, timers, clock } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    const written = recordWrites(reader);

    clock.set(2_000);

    timers.fire(POLL_INTERVAL_MS);

    await answer(loads, 1, Result.ok(readAt(2_000)), LIMIT);

    assert.deepStrictEqual(written(), ['readAt']);

    assert.strictEqual(reader.readAt.getSnapshot().value, 2_000);
  });

  test('a part that a read changed is replaced, and the others are kept', async () => {
    const { reader, loads, timers, clock } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    const written = recordWrites(reader);

    clock.set(3_000);

    timers.fire(POLL_INTERVAL_MS);

    await answer(
      loads,
      1,
      Result.ok({ ...readAt(2_000), merged: [MERGED] }),
      LIMIT,
    );

    assert.deepStrictEqual(reader.merged.getSnapshot().value, [MERGED]);

    assert.deepStrictEqual(written(), ['merged', 'readAt']);
  });

  test('says how the reading went apart from what it read', async () => {
    const { reader, loads, timers, clock } = setup(TOKEN_A);

    reader.start();

    assert.deepStrictEqual(reader.loadStatus.getSnapshot().value, {
      type: 'loading',
    });

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    const readyStatus = reader.loadStatus.getSnapshot().value;

    assert.deepStrictEqual(readyStatus, READY);

    clock.set(4_000);

    timers.fire(POLL_INTERVAL_MS);

    await answer(loads, 1, Result.ok(readAt(2_000)), LIMIT);

    assert.strictEqual(reader.loadStatus.getSnapshot().value, readyStatus);

    clock.set(5_000);

    timers.fire(POLL_INTERVAL_MS);

    await answer(loads, 2, Result.err('refused'), LIMIT);

    assert.deepStrictEqual(reader.loadStatus.getSnapshot().value, {
      type: 'ready',
      pollError: 'refused',
      refreshing: false,
    });
  });

  test('empties the parts when the token is forgotten', async () => {
    const { reader, loads, setToken } = setup(TOKEN_A);

    reader.start();

    await answer(
      loads,
      0,
      Result.ok({ ...readAt(1_000), merged: [MERGED] }),
      LIMIT,
    );

    setToken(undefined);

    assert.deepStrictEqual(reader.merged.getSnapshot().value, []);

    assert.strictEqual(reader.readAt.getSnapshot().value, 0);
  });

  test('refresh marks the report as refreshing and reads at once', async () => {
    const { reader, loads, clock } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    clock.set(1_500);

    reader.refresh();

    assert.strictEqual(loads.length, 2);

    assert.deepStrictEqual(shown(reader), {
      status: { type: 'ready', pollError: undefined, refreshing: true },
      readAt: 1_000,
    });

    await answer(loads, 1, Result.ok(readAt(2_000)), LIMIT);

    assert.deepStrictEqual(shown(reader), { status: READY, readAt: 2_000 });
  });

  test('reads again when the token changes, and not when only where it is kept does', () => {
    const { reader, loads, setToken } = setup(TOKEN_A);

    reader.start();

    setToken({ value: 'a', store: 'device' });

    assert.strictEqual(loads.length, 1);

    setToken({ value: 'b', store: 'session' });

    assert.deepStrictEqual(
      loads.map((l) => l.token),
      ['a', 'b'],
    );
  });

  test('forgetting the token empties the page, and a read still out for it is dropped', async () => {
    const { reader, loads, setToken } = setup(TOKEN_A);

    reader.start();

    setToken(undefined);

    assert.deepStrictEqual(shown(reader), { status: LOADING, readAt: 0 });

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    assert.deepStrictEqual(shown(reader), { status: LOADING, readAt: 0 });
  });

  test('a load that throws is a failure, not an unhandled rejection', async () => {
    const { reader, loads } = setup(TOKEN_A);

    reader.start();

    loads[0]?.reject(new Error('boom'));

    await settle();

    assert.deepStrictEqual(reader.loadStatus.getSnapshot().value, {
      type: 'failed',
      message: 'boom',
    });
  });

  test("a counter's first emission, at once, is not a tick", () => {
    const { reader, loads, clock, timers } = setup(TOKEN_A);

    reader.start();

    timers.emitFirst(POLL_INTERVAL_MS);

    clock.set(5_000);

    timers.emitFirst(CLOCK_TICK_MS);

    assert.strictEqual(loads.length, 1);

    assert.strictEqual(reader.nowMs.getSnapshot().value, 0);
  });

  test('stop ends the timers and the listeners', () => {
    const { reader, loads, timers, visibility, setToken } = setup(TOKEN_A);

    const stopReading = reader.start();

    stopReading();

    timers.fire(POLL_INTERVAL_MS);

    visibility.change();

    setToken({ value: 'b', store: 'session' });

    assert.strictEqual(loads.length, 1);

    assert.strictEqual(timers.running(), 0);

    assert.isFalse(visibility.listening());
  });
});

const TOKEN_A: StoredToken = { value: 'a', store: 'session' } as const;

const LIMIT: RateLimit = {
  limit: 5000,
  remaining: 4000,
  resetEpochMs: 0,
} as const;

type PendingLoad = Readonly<{
  token: string;
  nowMs: number;
  resolve: (answered: Answered<LoadedReport>) => void;
  reject: (error: unknown) => void;
}>;

type Setup = Readonly<{
  reader: Reader;
  loads: readonly PendingLoad[];
  clock: Readonly<{ set: (nowMs: number) => void }>;
  visibility: Readonly<{
    set: (visible: boolean) => void;
    change: () => void;
    listening: () => boolean;
  }>;
  setToken: (token: StoredToken | undefined) => unknown;
  timers: Readonly<{
    fire: (ms: number) => void;
    emitFirst: (ms: number) => void;
    running: () => number;
  }>;
}>;

const setup = (initialToken: StoredToken | undefined): Setup => {
  const [token, setToken] = createState<StoredToken | undefined>(initialToken);

  const mut_loads: PendingLoad[] = [];

  const mut_clock = { nowMs: 0 };

  /** One `counter` stand-in per interval the reader asks for. */
  const mut_counters = new Map<number, SourceObservable<number>>();

  const visibilityChange = source<undefined>();

  const mut_visibility = {
    visible: true,
    set: (visible: boolean) => {
      mut_visibility.visible = visible;
    },
    change: () => {
      visibilityChange.next(undefined);
    },
    listening: () => visibilityChange.hasSubscriber,
  };

  const reader = createReader({
    token,
    load: (tokenValue, nowMs) =>
      new Promise((resolve, reject) => {
        mut_loads.push({ token: tokenValue, nowMs, resolve, reject });
      }),
    now: () => mut_clock.nowMs,
    counter: (ms) => {
      const counter = source<number>();

      mut_counters.set(ms, counter);

      return counter;
    },
    isVisible: () => mut_visibility.visible,
    visibilityChange,
  });

  return {
    reader,
    loads: mut_loads,
    clock: {
      set: (nowMs: number) => {
        mut_clock.nowMs = nowMs;
      },
    },
    visibility: mut_visibility,
    setToken,
    timers: {
      // A counter's first emission is `0`, at once; a tick is the next one.
      fire: (ms: number) => {
        const counter = mut_counters.get(ms);

        counter?.next(1);
      },
      emitFirst: (ms: number) => {
        mut_counters.get(ms)?.next(0);
      },
      running: () =>
        mut_counters
          .values()
          .filter((counter) => !counter.isCompleted)
          .toArray().length,
    },
  } as const;
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
};

const answer = async (
  loads: readonly PendingLoad[],
  index: number,
  result: Result<LoadedReport, string>,
  rateLimit: RateLimit | undefined,
): Promise<void> => {
  loads[index]?.resolve({ result, rateLimit });

  await settle();
};

const shown = (
  reader: Reader,
): Readonly<{ status: LoadStatus; readAt: number }> =>
  ({
    status: reader.loadStatus.getSnapshot().value,
    readAt: reader.readAt.getSnapshot().value,
  }) as const;

/**
 * Listens to everything the page draws from, and answers with the names of
 * what has been written since, sorted.
 */
const recordWrites = (reader: Reader): (() => readonly string[]) => {
  const mut_written: string[] = [];

  const parts = {
    loadStatus: reader.loadStatus,
    readAt: reader.readAt,
    summary: reader.summary,
    entries: reader.entries,
    byNumber: reader.byNumber,
    scaleMax: reader.scaleMax,
    roots: reader.roots,
    cycles: reader.cycles,
    merged: reader.merged,
    issues: reader.issues,
    rateLimit: reader.rateLimit,
  } as const;

  for (const [partName, part] of Object.entries(parts)) {
    part.subscribe(() => {
      mut_written.push(partName);
    });
  }

  // Subscribing hands over what each holds now, which is not a write.
  mut_written.length = 0;

  return () => mut_written.toSorted();
};

const MERGED: Merged = {
  number: 7,
  title: 'feat: something',
  author: 'noshiro-pf',
  url: 'https://github.com/noshiro-pf/mono/pull/7',
  headRef: 'feat/something',
  baseRef: 'main',
  mergedAt: '2026-09-30T00:00:00Z',
  mergedAtEpochMs: 1_759_190_400_000,
  labels: [],
  linkedIssues: [],
} as const;

const readAt = (readAtEpochMs: number): LoadedReport =>
  ({
    repo: { owner: 'noshiro-pf', name: 'mono' },
    readAtEpochMs,
    required: [],
    summary: {
      open: 0,
      queued: 0,
      draft: 0,
      failing: 0,
      behind: 0,
      setAside: 0,
      awaitingReview: 0,
    },
    entries: [],
    roots: [],
    cycles: [],
    merged: [],
    issues: { items: [], totalCount: 0 },
  }) as const;
