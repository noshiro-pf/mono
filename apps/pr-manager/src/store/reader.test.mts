import { createState, source, type SourceObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import { CLOCK_TICK_MS, POLL_INTERVAL_MS } from '../constants.mjs';
import type { Answered } from '../graphql.mjs';
import type {
  IssueList,
  KnownParts,
  LoadedReport,
  Merged,
  ReadGroup,
} from '../load-report.mjs';
import { LOADING, READY, type LoadStatus } from '../load-state.mjs';
import type { RateLimit } from '../rate-limit.mjs';
import { ISSUES_LIMIT, ISSUES_PAGE_SIZE } from '../report-query.mjs';
import type { StoredToken } from '../token.mjs';
import type { WorkflowRunList } from '../workflow-runs.mjs';
import {
  createReader,
  type GroupRead,
  type PaneRead,
  type Reader,
} from './reader.mjs';

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

    await answer(loads, 1, Result.ok(readAt(2_000)), LIMIT);

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

    // Nothing it asked for is coming any more.
    assert.deepStrictEqual(reader.reading.getSnapshot().value, []);

    assert.deepStrictEqual(reader.failed.getSnapshot().value.merged, {
      message: 'refused',
      kept: false,
    });
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

  test('polls while the tab is visible', async () => {
    const { reader, loads, timers } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 2);

    await answer(loads, 1, Result.ok(readAt(2_000)), LIMIT);

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 3);
  });

  // A poll that went out while the read before it was still out would pay for
  // the same answer twice.
  test('a read asks for nothing a read still out is reading', async () => {
    const { reader, loads, runsLoads, timers } = setup(TOKEN_A);

    reader.start();

    timers.fire(POLL_INTERVAL_MS);

    reader.refresh();

    assert.strictEqual(loads.length, 1);

    assert.strictEqual(runsLoads.length, 1);

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    // The runs are still out; the report is read again without them.
    timers.fire(POLL_INTERVAL_MS);

    assert.deepStrictEqual(loads[1]?.groups, ['pulls', 'merged', 'issues']);

    assert.strictEqual(runsLoads.length, 1);
  });

  test('reads less often when a read costs more than a quarter of the budget allows', async () => {
    const { reader, loads, timers, clock } = setup(TOKEN_A);

    reader.start();

    clock.set(1_000);

    await answer(loads, 0, Result.ok(readAt(1_000)), budget(4000));

    timers.fire(POLL_INTERVAL_MS);

    // 30 points in 15 seconds: one read every 90 seconds spends 1,250 an hour.
    clock.set(16_000);

    await answer(loads, 1, Result.ok(readAt(16_000)), budget(3970));

    assert.strictEqual(reader.pollIntervalMs.getSnapshot().value, 90_000);

    // The fifteen-second timer is gone, and the next read is 90 seconds on.
    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 0);

    assert.strictEqual(timers.running(90_000), 1);

    timers.fire(90_000);

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

  test('reads, and moves the clock, when a hidden tab comes back', async () => {
    const { reader, loads, clock, visibility } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(0)), LIMIT);

    visibility.hide();

    assert.strictEqual(loads.length, 1);

    clock.set(20_000);

    visibility.show();

    assert.strictEqual(loads.length, 2);

    assert.strictEqual(reader.nowMs.getSnapshot().value, 20_000);
  });

  // Each read costs the whole report's points, and a reader going back and forth
  // between this tab and GitHub showed it dozens of times an hour, every one a
  // read the poll interval never counted.
  test('a tab shown again within an interval of the last read waits out the rest of it', async () => {
    const { reader, loads, clock, timers, visibility } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(0)), LIMIT);

    visibility.hide();

    clock.set(5_000);

    visibility.show();

    assert.strictEqual(loads.length, 1);

    assert.strictEqual(reader.nowMs.getSnapshot().value, 5_000);

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 0);

    assert.strictEqual(timers.running(10_000), 1);

    clock.set(15_000);

    timers.fire(10_000);

    assert.strictEqual(loads.length, 2);

    // Then the interval as ever, from that read.
    assert.strictEqual(timers.running(10_000), 0);

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 1);

    await answer(loads, 1, Result.ok(readAt(15_000)), LIMIT);

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 3);
  });

  // A failure can repeat on every read, and each costs points.
  test('a tab shown again after a read that failed waits out the interval too', async () => {
    const { reader, loads, clock, timers, visibility } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.err('offline'), LIMIT);

    visibility.hide();

    clock.set(5_000);

    visibility.show();

    assert.strictEqual(loads.length, 1);

    assert.strictEqual(timers.running(10_000), 1);
  });

  test('a tab shown again beside a poll that failed waits out the interval', async () => {
    const { reader, loads, clock, timers, visibility } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(0)), LIMIT);

    clock.set(15_000);

    timers.fire(POLL_INTERVAL_MS);

    await answer(loads, 1, Result.err('refused'), LIMIT);

    assert.deepStrictEqual(reader.loadStatus.getSnapshot().value, {
      type: 'ready',
      pollError: 'refused',
      refreshing: false,
    });

    visibility.hide();

    clock.set(20_000);

    visibility.show();

    assert.strictEqual(loads.length, 2);

    assert.strictEqual(timers.running(10_000), 1);
  });

  test('a tab shown again waits at most an interval, for a clock put back', async () => {
    const { reader, loads, clock, timers, visibility } = setup(TOKEN_A);

    clock.set(10_000);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(0)), LIMIT);

    visibility.hide();

    clock.set(0);

    visibility.show();

    assert.strictEqual(loads.length, 1);

    assert.strictEqual(timers.running(25_000), 0);

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 2);
  });

  test('a tab hidden before the rest of the interval is out reads nothing', () => {
    const { reader, loads, clock, timers, visibility } = setup(TOKEN_A);

    reader.start();

    visibility.hide();

    clock.set(5_000);

    visibility.show();

    visibility.hide();

    assert.strictEqual(timers.running(10_000), 0);

    timers.fire(10_000);

    assert.strictEqual(loads.length, 1);
  });

  // The failure this is here to prevent: a tab that came back was read at once
  // and then again at whatever point the old period had reached, which could be
  // a second later.
  test('a tab that comes back polls from the read it came back to', async () => {
    const { reader, loads, clock, timers, visibility } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(0)), LIMIT);

    visibility.hide();

    clock.set(POLL_INTERVAL_MS);

    visibility.show();

    assert.strictEqual(timers.started(POLL_INTERVAL_MS), 2);

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 1);

    assert.strictEqual(loads.length, 2);

    await answer(loads, 1, Result.ok(readAt(POLL_INTERVAL_MS)), LIMIT);

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 3);
  });

  test('a tab opened hidden reads once, and polls only once it is shown', async () => {
    const { reader, loads, clock, timers, visibility } = setup(TOKEN_A);

    visibility.set(false);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(0)), LIMIT);

    assert.strictEqual(loads.length, 1);

    assert.strictEqual(timers.running(POLL_INTERVAL_MS), 0);

    clock.set(POLL_INTERVAL_MS);

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
  // What it writes is only what changed, so nothing drawn from the rest is told
  // anything, let alone handed a new object.
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

  test('a pull request that did not change keeps its object when another is put before it', async () => {
    const { reader, loads, timers, clock } = setup(TOKEN_A);

    reader.start();

    await answer(
      loads,
      0,
      Result.ok({ ...readAt(1_000), merged: [MERGED] }),
      LIMIT,
    );

    const [held] = reader.merged.getSnapshot().value;

    clock.set(3_000);

    timers.fire(POLL_INTERVAL_MS);

    await answer(
      loads,
      1,
      Result.ok({
        ...readAt(2_000),
        merged: [{ ...MERGED, number: 8 }, structuredClone(MERGED)],
      }),
      LIMIT,
    );

    const [added, kept] = reader.merged.getSnapshot().value;

    assert.strictEqual(added?.number, 8);

    assert.strictEqual(kept, held);
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

  test('hands each read what the last one shown had, until the token changes', async () => {
    const { reader, loads, clock, setToken } = setup(TOKEN_A);

    reader.start();

    assert.deepStrictEqual(loads[0]?.previous, {});

    const parts: KnownParts = { pulls: PULLS, merged: [MERGED] } as const;

    const failed = {
      checks: { message: 'timed out', kept: false },
    } as const;

    await answer(
      loads,
      0,
      Result.ok({ ...readAt(1_000), parts, failed }),
      LIMIT,
    );

    // Each panel says what of it failed; the page as a whole is not a failure.
    assert.deepStrictEqual(reader.failed.getSnapshot().value, failed);

    assert.deepStrictEqual(reader.loadStatus.getSnapshot().value, READY);

    clock.set(2_000);

    reader.refresh();

    assert.deepStrictEqual(loads[1]?.previous, parts);

    assert.deepStrictEqual(loads[1]?.held(), {
      known: parts,
      failed,
      reading: new Set<ReadGroup>(['pulls', 'merged', 'issues']),
    });

    setToken(TOKEN_B);

    assert.deepStrictEqual(loads[2]?.previous, {});
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

  test('reads one pane on its own, once the page shows a report', async () => {
    const { reader, loads, sectionLoads, runsLoads, clock, timers } =
      setup(TOKEN_A);

    clock.set(1_000);

    reader.start();

    reader.refreshPane('merged');

    assert.deepStrictEqual(sectionLoads, []);

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    await answerRuns(runsLoads, 0, Result.ok(RUNS));

    clock.set(5_000);

    reader.refreshPane('merged');

    // Shut while it is out.
    reader.refreshPane('merged');

    assert.deepStrictEqual(
      reader.paneReading.getSnapshot().value,
      new Set<PaneRead>(['merged']),
    );

    assert.deepStrictEqual(
      sectionLoads.map(({ groups }) => groups),
      [['merged']],
    );

    // A poll meanwhile leaves it to the read out.
    timers.fire(POLL_INTERVAL_MS);

    assert.deepStrictEqual(loads[1]?.groups, ['pulls', 'issues']);

    await answer(loads, 1, Result.ok(readAt(5_000)), LIMIT);

    clock.set(6_000);

    await answer(
      sectionLoads,
      0,
      Result.ok({ ...readAt(6_000), merged: [MERGED] }),
      undefined,
    );

    assert.deepStrictEqual(reader.merged.getSnapshot().value, [MERGED]);

    // The page is said to be read when its pull requests were.
    assert.strictEqual(reader.readAt.getSnapshot().value, 5_000);

    reader.refreshPane('pulls');

    assert.deepStrictEqual(loads[2]?.groups, ['pulls']);

    // The poll's read of the runs is still out.
    reader.refreshPane('runs');

    assert.strictEqual(runsLoads.length, 2);

    await answerRuns(runsLoads, 1, Result.ok(RUNS));

    reader.refreshPane('runs');

    assert.strictEqual(runsLoads.length, 3);
  });

  test('a Refresh beside a pane read out settles when the rest answers', async () => {
    const { reader, loads, sectionLoads, clock } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    reader.refreshPane('merged');

    clock.set(2_000);

    reader.refresh();

    assert.deepStrictEqual(loads[1]?.groups, ['pulls', 'issues']);

    await answer(loads, 1, Result.ok(readAt(2_000)), LIMIT);

    assert.deepStrictEqual(shown(reader), { status: READY, readAt: 2_000 });

    // A pane's read that could not be made at all is said as a poll's is, until
    // the next read of the page.
    await answer(sectionLoads, 0, Result.err('timed out'), undefined);

    assert.deepStrictEqual(reader.loadStatus.getSnapshot().value, {
      type: 'ready',
      pollError: 'timed out',
      refreshing: false,
    });
  });

  test('drops a read for a token pasted again, which a newer read answers', async () => {
    const { reader, loads, setToken } = setup(TOKEN_A);

    reader.start();

    setToken(undefined);

    setToken(TOKEN_A);

    await answer(loads, 1, Result.ok(readAt(2_000)), LIMIT);

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    assert.strictEqual(reader.readAt.getSnapshot().value, 2_000);
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

  test('reads the workflow runs beside the report, on every read', async () => {
    const { reader, loads, runsLoads, timers } = setup(TOKEN_A);

    reader.start();

    assert.deepStrictEqual(
      runsLoads.map((l) => l.token),
      ['a'],
    );

    assert.deepStrictEqual(reader.runs.getSnapshot().value, {
      type: 'reading',
    });

    await answerRuns(runsLoads, 0, Result.ok(RUNS));

    // The runs do not wait for the report, nor the report for them.
    assert.deepStrictEqual(shown(reader), { status: LOADING, readAt: 0 });

    assert.deepStrictEqual(reader.runs.getSnapshot().value, {
      type: 'ready',
      list: RUNS,
      error: undefined,
    });

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    timers.fire(POLL_INTERVAL_MS);

    assert.strictEqual(loads.length, 2);

    assert.strictEqual(runsLoads.length, 2);
  });

  test('a read of the runs that fails keeps the list and says so, and leaves the report alone', async () => {
    const { reader, loads, runsLoads, timers, clock } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    await answerRuns(runsLoads, 0, Result.err('refused'));

    assert.deepStrictEqual(reader.runs.getSnapshot().value, {
      type: 'failed',
      message: 'refused',
    });

    assert.deepStrictEqual(shown(reader), { status: READY, readAt: 1_000 });

    clock.set(2_000);

    timers.fire(POLL_INTERVAL_MS);

    await answer(loads, 1, Result.ok(readAt(1_000)), LIMIT);

    await answerRuns(runsLoads, 1, Result.ok(RUNS));

    clock.set(3_000);

    timers.fire(POLL_INTERVAL_MS);

    await answer(loads, 2, Result.ok(readAt(1_000)), LIMIT);

    await answerRuns(runsLoads, 2, Result.err('spent'));

    assert.deepStrictEqual(reader.runs.getSnapshot().value, {
      type: 'ready',
      list: RUNS,
      error: 'spent',
    });

    assert.deepStrictEqual(shown(reader), { status: READY, readAt: 1_000 });
  });

  test('a read of the runs out is not asked for again', async () => {
    const { reader, loads, runsLoads, timers } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    reader.refreshPane('runs');

    timers.fire(POLL_INTERVAL_MS);

    await answer(loads, 1, Result.ok(readAt(2_000)), LIMIT);

    assert.strictEqual(runsLoads.length, 1);

    await answerRuns(runsLoads, 0, Result.ok(NO_RUNS));

    reader.refreshPane('runs');

    assert.strictEqual(runsLoads.length, 2);
  });

  test('an older read of the runs never replaces a newer one', async () => {
    const { reader, runsLoads, setToken, clock } = setup(TOKEN_A);

    clock.set(1_000);

    reader.start();

    clock.set(2_000);

    // The same token pasted again, which reads the runs again while the first
    // read of them is out.
    setToken(undefined);

    setToken(TOKEN_A);

    await answerRuns(runsLoads, 1, Result.ok(NO_RUNS));

    await answerRuns(runsLoads, 0, Result.ok(RUNS));

    assert.deepStrictEqual(reader.runs.getSnapshot().value, {
      type: 'ready',
      list: NO_RUNS,
      error: undefined,
    });
  });

  test('forgetting the token puts the runs back to reading, and drops a read still out', async () => {
    const { reader, loads, runsLoads, setToken } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    await answerRuns(runsLoads, 0, Result.ok(RUNS));

    setToken(undefined);

    assert.deepStrictEqual(reader.runs.getSnapshot().value, {
      type: 'reading',
    });

    setToken(TOKEN_B);

    await answer(loads, 1, Result.ok(readAt(1_000)), LIMIT);

    setToken(undefined);

    await answerRuns(runsLoads, 1, Result.ok(RUNS));

    assert.deepStrictEqual(reader.runs.getSnapshot().value, {
      type: 'reading',
    });
  });

  test('a read of the runs that throws is a failure, not an unhandled rejection', async () => {
    const { reader, loads, runsLoads } = setup(TOKEN_A);

    reader.start();

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    runsLoads[0]?.reject(new Error('boom'));

    await settle();

    assert.strictEqual(reader.runs.getSnapshot().value.type, 'failed');
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

    test('hands the page to the next read, which keeps it if its issues fail', async () => {
      const { reader, loads, issueLoads, timers } = setup(TOKEN_A);

      reader.start();

      const first = withIssues(1_000, [1], 'c1');

      await answer(
        loads,
        0,
        Result.ok({ ...first, parts: { issues: first.issues } }),
        LIMIT,
      );

      reader.loadMoreIssues();

      await answerIssues(issueLoads, 0, Result.ok(issueList([2], 'c2')));

      timers.fire(POLL_INTERVAL_MS);

      assert.deepStrictEqual(
        loads[1]?.previous.issues?.items.map(({ number }) => number),
        [1, 2],
      );
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

  test('says when a read is out, a poll as much as the first', async () => {
    const { reader, loads, timers } = setup(TOKEN_A);

    reader.start();

    assert.isTrue(reader.fetching.getSnapshot().value);

    await answer(loads, 0, Result.ok(readAt(1_000)), LIMIT);

    assert.isFalse(reader.fetching.getSnapshot().value);

    timers.fire(POLL_INTERVAL_MS);

    assert.isTrue(reader.fetching.getSnapshot().value);

    loads[1]?.reject(new Error('boom'));

    await settle();

    assert.isFalse(reader.fetching.getSnapshot().value);
  });

  test('a load that throws rather than rejects is not a read left out for good', async () => {
    const [token] = createState<StoredToken | undefined>(TOKEN_A);

    const reader = createReader({
      token,
      load: () => {
        throw new Error('boom');
      },
      loadRuns: () => Promise.resolve(Result.err('unread')),
      loadIssues: () => Promise.reject(new Error('unused')),
      now: () => 0,
      counter: () => source<number>(),
      isVisible: () => true,
      visibilityChange: source<undefined>(),
    });

    reader.start();

    await settle();

    assert.isFalse(reader.fetching.getSnapshot().value);

    assert.deepStrictEqual(reader.loadStatus.getSnapshot().value, {
      type: 'failed',
      message: 'boom',
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

type PendingLoad = GroupRead &
  Readonly<{
    resolve: (answered: Answered<LoadedReport>) => void;
    reject: (error: unknown) => void;
  }>;

type PendingRunsLoad = Readonly<{
  token: string;
  resolve: (result: Result<WorkflowRunList, string>) => void;
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
  /** The reads of the pull requests, each of them alone. */
  loads: readonly PendingLoad[];
  /** The reads of the merged pull requests and of the open issues. */
  sectionLoads: readonly PendingLoad[];
  runsLoads: readonly PendingRunsLoad[];
  issueLoads: readonly PendingIssueLoad[];
  clock: Readonly<{ set: (nowMs: number) => void }>;
  visibility: Readonly<{
    /** Changes what `isVisible` answers, without the event. */
    set: (visible: boolean) => void;
    /** Hides the tab and says so, as the browser does. */
    hide: () => void;
    /** Shows the tab and says so. */
    show: () => void;
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

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
};

const setup = (initialToken: StoredToken | undefined): Setup => {
  const [token, setToken] = createState<StoredToken | undefined>(initialToken);

  const mut_loads: PendingLoad[] = [];

  const mut_sectionLoads: PendingLoad[] = [];

  const mut_runsLoads: PendingRunsLoad[] = [];

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
  };

  const reader = createReader({
    token,
    load: (request) =>
      new Promise((resolve, reject) => {
        if (request.groups.includes('pulls')) {
          mut_loads.push({ ...request, resolve, reject });
        } else {
          mut_sectionLoads.push({ ...request, resolve, reject });
        }
      }),
    loadRuns: (tokenValue) =>
      new Promise((resolve, reject) => {
        mut_runsLoads.push({ token: tokenValue, resolve, reject });
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
    sectionLoads: mut_sectionLoads,
    runsLoads: mut_runsLoads,
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

const answer = async (
  loads: readonly PendingLoad[],
  index: number,
  result: Result<LoadedReport, string>,
  rateLimit: RateLimit | undefined,
): Promise<void> => {
  loads[index]?.resolve({ result, rateLimit });

  await settle();
};

const answerRuns = async (
  runsLoads: readonly PendingRunsLoad[],
  index: number,
  result: Result<WorkflowRunList, string>,
): Promise<void> => {
  runsLoads[index]?.resolve(result);

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
 * Listens to everything the page draws from, and answers with the names of what
 * has been written since, sorted.
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
  const handedOver = mut_written.length;

  return () => mut_written.slice(handedOver).toSorted();
};

const RUNS: WorkflowRunList = {
  runs: [
    {
      id: 1,
      workflow: 'code-check',
      title: 'feat: something',
      runNumber: 12,
      url: 'https://github.com/noshiro-pf/mono/actions/runs/1',
      event: 'pull_request',
      branch: 'feat/something',
      actor: 'noshiro-pf',
      state: 'in_progress',
      createdAt: '2026-10-15T10:00:00Z',
    },
  ],
  totalCount: 1,
} as const;

const NO_RUNS: WorkflowRunList = { runs: [], totalCount: 0 } as const;

const PULLS: NonNullable<KnownParts['pulls']> = {
  defaultBranch: 'main',
  queue: true,
  codeOwners: [],
  codeOwnersEnforcedBy: undefined,
  pulls: [],
} as const;

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
    features: { requiredChecks: true, codeOwnerReview: true, queue: true },
    summary: {
      open: 0,
      queued: 0,
      draft: 0,
      failing: 0,
      setAside: 0,
      awaitingReview: 0,
      pending: 0,
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
    queue: undefined,
    reading: [],
    failed: {},
    parts: {},
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
      misplacedMergeAfter: [],
    })),
    totalCount: 200,
    endCursor,
    referenced: [],
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

const budget = (remaining: number): RateLimit =>
  ({ remaining, limit: 5000, resetEpochMs: 3_600_000 }) as const;
