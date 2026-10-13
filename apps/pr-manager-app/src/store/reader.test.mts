import { createState, source, type SourceObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import { CLOCK_TICK_MS, POLL_INTERVAL_MS } from '../constants.mjs';
import type { Answered } from '../graphql.mjs';
import type { IssueList, LoadedReport, Merged } from '../load-report.mjs';
import { LOADING, READY, type LoadStatus } from '../load-state.mjs';
import type { RateLimit } from '../rate-limit.mjs';
import { ISSUES_LIMIT, ISSUES_PAGE_SIZE } from '../report-query.mjs';
import type { StoredToken } from '../token.mjs';
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

  test('draws the first read part by part, as its parts answer', async () => {
    const { reader, loads, clock } = setup(TOKEN_A);

    // The read starts at the instant its report is said to be read at.
    clock.set(1_000);

    reader.start();

    const onProgress = loads[0]?.onProgress;

    assert.isDefined(onProgress);

    clock.set(1_200);

    onProgress({ ...readAt(1_000), reading: ['merged', 'issues'] });

    assert.deepStrictEqual(shown(reader), { status: READY, readAt: 1_000 });

    assert.deepStrictEqual(reader.reading.getSnapshot().value, [
      'merged',
      'issues',
    ]);

    assert.strictEqual(reader.nowMs.getSnapshot().value, 1_200);

    await answer(
      loads,
      0,
      Result.ok({ ...readAt(1_000), merged: [MERGED] }),
      LIMIT,
    );

    assert.deepStrictEqual(reader.reading.getSnapshot().value, []);

    assert.deepStrictEqual(reader.merged.getSnapshot().value, [MERGED]);
  });

  test('replaces a report on screen whole, never part by part', async () => {
    const { reader, loads, timers } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    timers.fire(POLL_INTERVAL_MS);

    reader.refresh();

    assert.deepStrictEqual(
      loads.map(({ onProgress }) => onProgress === undefined),
      [false, true, true],
    );
  });

  test('says a part failed beside the parts that answered', async () => {
    const { reader, loads, clock } = setup(TOKEN_A);

    clock.set(1_000);

    reader.start();

    loads[0]?.onProgress?.({ ...readAt(1_000), reading: ['merged'] });

    await answer(loads, 0, Result.err('refused'), LIMIT);

    assert.deepStrictEqual(reader.loadStatus.getSnapshot().value, {
      type: 'ready',
      pollError: 'refused',
      refreshing: false,
    });

    assert.deepStrictEqual(reader.reading.getSnapshot().value, ['merged']);
  });

  test('drops the parts of a read for a token since forgotten', () => {
    const { reader, loads, setToken } = setup(TOKEN_A);

    reader.start();

    setToken(undefined);

    loads[0]?.onProgress?.(readAt(1_000));

    assert.deepStrictEqual(shown(reader), { status: LOADING, readAt: 0 });
  });

  test('keeps the last rate limit when an answer carries none', async () => {
    const { reader, loads, timers } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    timers.fire(POLL_INTERVAL_MS);

    await answer(loads, 1, Result.err('network'), undefined);

    assert.deepStrictEqual(reader.rateLimit.getSnapshot().value, LIMIT);
  });

  test('polls while the tab is visible', () => {
    const { reader, loads, timers } = setup(TOKEN_A);

    reader.start();

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 2);

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 3);
  });

  test('stops the poll timer when the tab is hidden', () => {
    const { reader, loads, timers, visibility } = setup(TOKEN_A);

    reader.start();

    visibility.hide();

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 0);

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 1);
  });

  test('reads, and moves the clock, when a hidden tab comes back', () => {
    const { reader, loads, clock, visibility } = setup(TOKEN_A);

    reader.start();

    visibility.hide();

    assert.strictEqual(loads.length, 1);

    clock.set(9_000);

    visibility.show();

    assert.strictEqual(loads.length, 2);

    assert.strictEqual(reader.nowMs.getSnapshot().value, 9_000);
  });

  // The failure this is here to prevent: a tab that came back was read at
  // once and then again at whatever point the old period had reached, which
  // could be a second later.
  test('a tab that comes back polls from the read it came back to', () => {
    const { reader, loads, timers, visibility } = setup(TOKEN_A);

    reader.start();

    visibility.hide();

    visibility.show();

    assert.strictEqual(timers.started(POLL_INTERVAL_MS), 2);

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 1);

    assert.strictEqual(loads.length, 2);

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 3);
  });

  test('a tab opened hidden reads once, and polls only once it is shown', () => {
    const { reader, loads, timers, visibility } = setup(TOKEN_A);

    visibility.set(false);

    reader.start();

    assert.strictEqual(loads.length, 1);

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 0);

    visibility.show();

    assert.strictEqual(loads.length, 2);

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 1);
  });

  test('being shown twice leaves one poll timer', () => {
    const { reader, timers, visibility } = setup(TOKEN_A);

    reader.start();

    visibility.show();

    visibility.show();

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 1);
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

  test('stop ends the timers and the listeners', () => {
    const { reader, loads, timers, visibility, setToken } = setup(TOKEN_A);

    const stopReading = reader.start();

    stopReading();

    timers.fire(POLL_INTERVAL_MS);

    visibility.show();

    setToken({ value: 'b', store: 'session' });

    assert.strictEqual(loads.length, 1);

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 0);

    assert.strictEqual(timers.running(CLOCK_TICK_MS), 0);

    assert.isFalse(visibility.listening());
  });

  test('stop ends a poll timer started by the tab coming back', () => {
    const { reader, timers, visibility } = setup(TOKEN_A);

    const stopReading = reader.start();

    visibility.hide();

    visibility.show();

    stopReading();

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 0);
  });

  describe('loadMoreIssues', () => {
    test('lists the next page, and every read after lists it too', async () => {
      const { reader, loads, issueLoads, timers } = setup(TOKEN_A);

      reader.start();

      assert.strictEqual(loads[0]?.issueCount, ISSUES_LIMIT);

      await answer(loads, 0, Result.ok(withIssues(1_000, [1], 'c1')), LIMIT);

      reader.loadMoreIssues();

      assert.deepStrictEqual(
        issueLoads.map(({ token, after, first }) => ({ token, after, first })),
        [{ token: 'a', after: 'c1', first: ISSUES_PAGE_SIZE }],
      );

      assert.deepStrictEqual(reader.moreIssues.getSnapshot().value, {
        type: 'loading',
      });

      await answerIssues(issueLoads, 0, Result.ok(issueList([2], 'c2')));

      assert.deepStrictEqual(listed(reader), [1, 2]);

      assert.strictEqual(reader.issues.getSnapshot().value.endCursor, 'c2');

      assert.deepStrictEqual(reader.moreIssues.getSnapshot().value, {
        type: 'idle',
      });

      timers.fire(POLL_INTERVAL_MS);

      assert.strictEqual(loads[1]?.issueCount, ISSUES_LIMIT + ISSUES_PAGE_SIZE);
    });

    test('asks once while a page is out', async () => {
      const { reader, loads, issueLoads } = setup(TOKEN_A);

      reader.start();

      await answer(loads, 0, Result.ok(withIssues(1_000, [1], 'c1')), LIMIT);

      reader.loadMoreIssues();

      reader.loadMoreIssues();

      assert.strictEqual(issueLoads.length, 1);
    });

    test('asks nothing once every open issue is listed', async () => {
      const { reader, loads, issueLoads } = setup(TOKEN_A);

      reader.start();

      await answer(
        loads,
        0,
        Result.ok(withIssues(1_000, [1], undefined)),
        LIMIT,
      );

      reader.loadMoreIssues();

      assert.strictEqual(issueLoads.length, 0);
    });

    // The failure this is here to prevent: a poll that went out before the
    // button was pressed answered after the page did, and took the page away
    // again until the next poll.
    test('a read asked before the press leaves the page it added', async () => {
      const { reader, loads, issueLoads, timers, clock } = setup(TOKEN_A);

      reader.start();

      await answer(loads, 0, Result.ok(withIssues(1_000, [1], 'c1')), LIMIT);

      clock.set(1_500);

      timers.fire(POLL_INTERVAL_MS);

      reader.loadMoreIssues();

      await answerIssues(issueLoads, 0, Result.ok(issueList([2], 'c2')));

      await answer(loads, 1, Result.ok(withIssues(2_000, [1], 'c1')), LIMIT);

      assert.deepStrictEqual(listed(reader), [1, 2]);

      assert.strictEqual(reader.readAt.getSnapshot().value, 2_000);
    });

    test('a page a newer read already listed is dropped', async () => {
      const { reader, loads, issueLoads, timers, clock } = setup(TOKEN_A);

      reader.start();

      await answer(loads, 0, Result.ok(withIssues(1_000, [1], 'c1')), LIMIT);

      reader.loadMoreIssues();

      await answerIssues(issueLoads, 0, Result.ok(issueList([2], 'c2')));

      reader.loadMoreIssues();

      clock.set(1_500);

      timers.fire(POLL_INTERVAL_MS);

      await answer(
        loads,
        1,
        Result.ok(withIssues(2_000, [3, 1, 2, 4], 'c4')),
        LIMIT,
      );

      await answerIssues(issueLoads, 1, Result.ok(issueList([4], 'c4')));

      assert.deepStrictEqual(listed(reader), [3, 1, 2, 4]);
    });

    test('says why a page could not be read, and keeps the list', async () => {
      const { reader, loads, issueLoads } = setup(TOKEN_A);

      reader.start();

      await answer(loads, 0, Result.ok(withIssues(1_000, [1], 'c1')), LIMIT);

      reader.loadMoreIssues();

      await answerIssues(issueLoads, 0, Result.err('network'));

      assert.deepStrictEqual(reader.moreIssues.getSnapshot().value, {
        type: 'failed',
        message: 'network',
      });

      assert.deepStrictEqual(listed(reader), [1]);
    });

    test('a new token lists the first page again', async () => {
      const { reader, loads, issueLoads, setToken } = setup(TOKEN_A);

      reader.start();

      await answer(loads, 0, Result.ok(withIssues(1_000, [1], 'c1')), LIMIT);

      reader.loadMoreIssues();

      setToken(TOKEN_B);

      assert.strictEqual(loads.at(-1)?.issueCount, ISSUES_LIMIT);

      await answerIssues(issueLoads, 0, Result.ok(issueList([2], 'c2')));

      assert.deepStrictEqual(listed(reader), [1]);

      assert.deepStrictEqual(reader.moreIssues.getSnapshot().value, {
        type: 'idle',
      });
    });
  });
});

const TOKEN_B: StoredToken = { value: 'b', store: 'session' } as const;

const TOKEN_A: StoredToken = { value: 'a', store: 'session' } as const;

const LIMIT: RateLimit = {
  limit: 5000,
  remaining: 4000,
  resetEpochMs: 0,
} as const;

type PendingLoad = Readonly<{
  token: string;
  nowMs: number;
  issueCount: number;
  onProgress: ((report: LoadedReport) => void) | undefined;
  resolve: (answered: Answered<LoadedReport>) => void;
  reject: (error: unknown) => void;
}>;

type PendingIssueLoad = Readonly<{
  token: string;
  after: string;
  first: number;
  resolve: (answered: Answered<IssueList>) => void;
}>;

type Setup = Readonly<{
  reader: Reader;
  loads: readonly PendingLoad[];
  issueLoads: readonly PendingIssueLoad[];
  clock: Readonly<{ set: (nowMs: number) => void }>;
  visibility: Readonly<{
    /** Changes what `isVisible` answers, without the event. */
    set: (visible: boolean) => void;
    /** Hides the tab and says so, as the browser does. */
    hide: () => void;
    /** Shows the tab and says so. */
    show: () => void;
    listening: () => boolean;
  }>;
  setToken: (token: StoredToken | undefined) => unknown;
  timers: Readonly<{
    /** Ticks the newest timer of this interval. */
    fire: (ms: number) => void;
    /** How many timers of this interval were ever asked for. */
    started: (ms: number) => number;
    /** How many timers of this interval are not yet completed. */
    running: (ms: number) => number;
  }>;
}>;

const setup = (initialToken: StoredToken | undefined): Setup => {
  const [token, setToken] = createState<StoredToken | undefined>(initialToken);

  const mut_loads: PendingLoad[] = [];

  const mut_issueLoads: PendingIssueLoad[] = [];

  const mut_clock = { nowMs: 0 };

  /** One `counter` stand-in per timer the reader asks for, oldest first. */
  const mut_counters: Readonly<{
    ms: number;
    counter: SourceObservable<number>;
  }>[] = [];

  const countersOf = (ms: number): readonly SourceObservable<number>[] =>
    mut_counters.filter((c) => c.ms === ms).map((c) => c.counter);

  const visibilityChange = source<undefined>();

  const mut_visibility = {
    visible: true,
    set: (visible: boolean) => {
      mut_visibility.visible = visible;
    },
    hide: () => {
      mut_visibility.visible = false;

      visibilityChange.next(undefined);
    },
    show: () => {
      mut_visibility.visible = true;

      visibilityChange.next(undefined);
    },
    listening: () => visibilityChange.hasSubscriber,
  };

  const reader = createReader({
    token,
    load: (tokenValue, nowMs, issueCount, onProgress) =>
      new Promise((resolve, reject) => {
        mut_loads.push({
          token: tokenValue,
          nowMs,
          issueCount,
          onProgress,
          resolve,
          reject,
        });
      }),
    loadIssues: (tokenValue, after, first) =>
      new Promise((resolve) => {
        mut_issueLoads.push({ token: tokenValue, after, first, resolve });
      }),
    now: () => mut_clock.nowMs,
    counter: (ms) => {
      const counter = source<number>();

      mut_counters.push({ ms, counter });

      return counter;
    },
    isVisible: () => mut_visibility.visible,
    visibilityChange,
  });

  return {
    reader,
    loads: mut_loads,
    issueLoads: mut_issueLoads,
    clock: {
      set: (nowMs: number) => {
        mut_clock.nowMs = nowMs;
      },
    },
    visibility: mut_visibility,
    setToken,
    timers: {
      fire: (ms: number) => {
        countersOf(ms).at(-1)?.next(1);
      },
      started: (ms: number) => countersOf(ms).length,
      running: (ms: number) =>
        countersOf(ms).filter((counter) => !counter.isCompleted).length,
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

const answerIssues = async (
  issueLoads: readonly PendingIssueLoad[],
  index: number,
  result: Result<IssueList, string>,
): Promise<void> => {
  issueLoads[index]?.resolve({ result, rateLimit: undefined });

  await settle();
};

const listed = (reader: Reader): readonly number[] =>
  reader.issues.getSnapshot().value.items.map(({ number }) => number);

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
    reading: reader.reading,
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
    issues: {
      items: [],
      totalCount: 0,
      endCursor: undefined,
      referenced: [],
    },
    reading: [],
  }) as const;

const withIssues = (
  readAtEpochMs: number,
  numbers: readonly number[],
  endCursor: string | undefined,
): LoadedReport =>
  ({
    ...readAt(readAtEpochMs),
    issues: issueList(numbers, endCursor),
  }) as const;

const issueList = (
  numbers: readonly number[],
  endCursor: string | undefined,
): IssueList =>
  ({
    items: numbers.map((number) => ({
      number,
      title: `Issue ${number}`,
      author: 'someone',
      url: `https://github.com/noshiro-pf/mono/issues/${number}`,
      labels: [],
      createdAt: '2026-09-20T00:00:00Z',
      updatedAt: '2026-09-23T00:00:00Z',
      comments: 0,
      startAfter: [],
    })),
    totalCount: 200,
    endCursor,
    referenced: [],
  }) as const;
