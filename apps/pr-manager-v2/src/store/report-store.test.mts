import { createState } from 'synstate';
import { Result } from 'ts-data-forge';
import { failed, pull, snapshot } from '../../test/index.mjs';
import type { StoredToken } from '../github/index.mjs';
import {
  createReportStore,
  isReading,
  type ReadReport,
  type ReportRead,
} from './report-store.mjs';
import { manualTimers } from './timers.mjs';

describe(createReportStore, () => {
  test('reads nothing without a token, then everything on one', async () => {
    const { store, setToken, reads } = setup(() => answer(ok));

    await flush();

    assert.strictEqual(reads(), 0);

    assert.strictEqual(store.status.getSnapshot().value.kind, 'no-token');

    setToken(TOKEN);

    await flush();

    assert.strictEqual(reads(), 1);

    assert.deepStrictEqual(store.status.getSnapshot().value, {
      kind: 'ready',
      readAtMs: 0,
      reading: false,
      failure: undefined,
    });

    assert.isTrue(
      Result.isOk(store.report.getSnapshot().value?.decision ?? Result.err(0)),
    );
  });

  test('keeps the report through a read that brings nothing, and says why', async () => {
    let mut_fail = false;

    const { store, setToken } = setup(() => answer(mut_fail ? nothing : ok));

    setToken(TOKEN);

    await flush();

    mut_fail = true;

    store.refresh();

    await flush();

    assert.isDefined(store.report.getSnapshot().value);

    const status = store.status.getSnapshot().value;

    assert.strictEqual(
      status.kind === 'ready' ? status.failure : undefined,
      'Could not read the repository: 502',
    );
  });

  test('keeps a part’s last answer when it alone fails', async () => {
    let mut_fail = false;

    const { store, setToken } = setup(() =>
      answer(
        mut_fail
          ? {
              snapshot: Result.ok(
                snapshot([pull(1)], [], { merged: failed('the merged') }),
              ),
              runs: failed('the runs'),
            }
          : ok,
      ),
    );

    setToken(TOKEN);

    await flush();

    mut_fail = true;

    store.refresh();

    await flush();

    const report = store.report.getSnapshot().value;

    assert.isTrue(Result.isOk(report?.snapshot.merged ?? Result.err(0)));

    assert.isTrue(
      Result.isOk(store.runs.getSnapshot().value?.runs ?? Result.err(0)),
    );

    assert.strictEqual(
      store.runs.getSnapshot().value?.failure?.what,
      'the runs',
    );

    assert.deepStrictEqual(
      report?.failures.merged.map(({ what }) => what),
      ['the merged'],
    );
  });

  test('decides the issues without pull requests never read, and says so', async () => {
    const { store, setToken } = setup(() =>
      answer({
        snapshot: Result.ok(
          snapshot([], [], { pullRequests: failed('the pull requests') }),
        ),
        runs: ok.runs,
      }),
    );

    setToken(TOKEN);

    await flush();

    const report = store.report.getSnapshot().value;

    assert.isTrue(Result.isErr(report?.decision ?? Result.ok(0)));

    assert.isTrue(Result.isOk(report?.issueDecision ?? Result.err(0)));

    assert.deepStrictEqual(
      report?.failures.issues.map(({ what }) => what),
      ['the pull requests'],
    );
  });

  test('says when GitHub refused the token itself, until a new one', async () => {
    let mut_refuse = true;

    const { store, setToken } = setup(() =>
      answer(
        mut_refuse
          ? {
              snapshot: Result.err({
                kind: 'refused',
                what: 'the repository',
                message: '401: Bad credentials',
              }),
              runs: ok.runs,
            }
          : ok,
      ),
    );

    setToken(TOKEN);

    await flush();

    assert.isTrue(store.tokenRefused.getSnapshot().value);

    mut_refuse = false;

    setToken({ value: 'another', place: 'session' });

    assert.isFalse(store.tokenRefused.getSnapshot().value);

    await flush();

    assert.isFalse(store.tokenRefused.getSnapshot().value);
  });

  test('reads on after drawing a read threw, and says so', async () => {
    const { store, timers, setToken, reads } = setup(() => answer(ok));

    let mut_throw = true;

    store.report.subscribe((report) => {
      if (report === undefined || !mut_throw) {
        return;
      }

      mut_throw = false;

      throw new Error('drawing failed');
    });

    setToken(TOKEN);

    await flush();

    const status = store.status.getSnapshot().value;

    assert.strictEqual(
      status.kind === 'ready' ? status.failure : undefined,
      'Could not draw what was read: drawing failed',
    );

    timers.advance(15_000);

    await flush();

    assert.strictEqual(reads(), 2);
  });

  test('keeps the age of the report on screen when drawing a read threw', async () => {
    const { store, timers, setToken } = setup(() => answer(ok));

    setToken(TOKEN);

    await flush();

    // The subscription is told the current runs at once, then this read's.
    let mut_calls = 0;

    // Thrown before the new report is put on the page: the old one stays.
    store.runs.subscribe(() => {
      mut_calls += 1;

      if (mut_calls !== 2) {
        return;
      }

      throw new Error('drawing failed');
    });

    timers.advance(15_000);

    await flush();

    const status = store.status.getSnapshot().value;

    assert.deepStrictEqual(
      status.kind === 'ready' ? [status.readAtMs, status.failure] : [],
      [0, 'Could not draw what was read: drawing failed'],
    );
  });

  test('drops a read still out when the store stops', async () => {
    const { store, setToken, stop } = setup(() => answer(ok));

    setToken(TOKEN);

    stop();

    await flush();

    assert.isUndefined(store.report.getSnapshot().value);
  });

  test('shows the runs read even when the snapshot failed', async () => {
    const { store, setToken } = setup(() =>
      answer({ snapshot: failed('the repository'), runs: ok.runs }),
    );

    setToken(TOKEN);

    await flush();

    assert.strictEqual(store.status.getSnapshot().value.kind, 'failed');

    assert.isTrue(
      Result.isOk(store.runs.getSnapshot().value?.runs ?? Result.err(0)),
    );
  });

  test('says a first read that brought nothing failed, with no age', async () => {
    const { store, setToken } = setup(() => answer(nothing));

    setToken(TOKEN);

    await flush();

    assert.strictEqual(store.status.getSnapshot().value.kind, 'failed');

    assert.isUndefined(store.report.getSnapshot().value);

    // Read again, the reason stays on screen while the read is out.
    store.refresh();

    const retrying = store.status.getSnapshot().value;

    assert.deepStrictEqual(
      retrying.kind === 'failed' ? [retrying.reading, isReading(retrying)] : [],
      [true, true],
    );
  });

  test('a token given to a hidden tab is read once the tab is shown', async () => {
    const { store, timers, setToken, setVisible, reads } = setup(() =>
      answer(ok),
    );

    setVisible(false);

    setToken(TOKEN);

    await flush();

    assert.strictEqual(reads(), 0);

    assert.strictEqual(store.status.getSnapshot().value.kind, 'waiting');

    assert.isFalse(isReading(store.status.getSnapshot().value));

    setVisible(true);

    timers.advance(0);

    await flush();

    assert.strictEqual(reads(), 1);
  });

  test('polls every interval while visible, and not while hidden', async () => {
    const { timers, setToken, setVisible, reads } = setup(() => answer(ok));

    setToken(TOKEN);

    await flush();

    timers.advance(15_000);

    await flush();

    assert.strictEqual(reads(), 2);

    setVisible(false);

    timers.advance(60_000);

    await flush();

    assert.strictEqual(reads(), 2);

    // Shown again with an interval past: it reads at once.
    setVisible(true);

    timers.advance(0);

    await flush();

    assert.strictEqual(reads(), 3);
  });

  test('reads again once a read ends when Refresh is asked during it', async () => {
    const held = holder();

    const { store, setToken, reads } = setup((n) =>
      n === 1 ? held.promise : answer(ok),
    );

    setToken(TOKEN);

    await flush();

    store.refresh();

    store.refresh();

    await flush();

    assert.strictEqual(reads(), 1);

    held.release(ok);

    await flush();

    assert.strictEqual(reads(), 2);
  });

  test('drops what a read asked with a replaced token brings', async () => {
    const held = holder();

    const { store, setToken } = setup((n) =>
      n === 1 ? held.promise : new Promise<ReportRead>(noop),
    );

    setToken(TOKEN);

    await flush();

    setToken({ value: 'u', place: 'session' });

    held.release(ok);

    await flush();

    assert.isUndefined(store.report.getSnapshot().value);

    assert.strictEqual(store.status.getSnapshot().value.kind, 'first-read');
  });

  test('empties the page when the token is cleared', async () => {
    const { store, setToken } = setup(() => answer(ok));

    setToken(TOKEN);

    await flush();

    setToken(undefined);

    assert.isUndefined(store.report.getSnapshot().value);

    assert.strictEqual(store.status.getSnapshot().value.kind, 'no-token');
  });

  test('sends nothing a Refresh asked for once stopped', async () => {
    const held = holder();

    const { store, setToken, stop, reads } = setup((n) =>
      n === 1 ? held.promise : answer(ok),
    );

    setToken(TOKEN);

    await flush();

    store.refresh();

    stop();

    held.release(ok);

    await flush();

    assert.strictEqual(reads(), 1);
  });

  test('shows the lowest GraphQL budget a read reached', async () => {
    const { store, setToken } = setup((_, onBudget) => {
      onBudget('graphql', { remaining: 4900, limit: 5000, resetAtMs: 9 });

      onBudget('graphql', { remaining: 4950, limit: 5000, resetAtMs: 9 });

      onBudget('core', { remaining: 10, limit: 5000, resetAtMs: 9 });

      return Promise.resolve(ok);
    });

    setToken(TOKEN);

    await flush();

    assert.strictEqual(
      store.budget.getSnapshot().value.rateLimit?.remaining,
      4900,
    );
  });
});

const TOKEN: StoredToken = { value: 't', place: 'session' } as const;

const ok: ReportRead = {
  snapshot: Result.ok(snapshot([pull(1)])),
  runs: Result.ok({ runs: [], complete: true }),
} as const;

const nothing: ReportRead = {
  snapshot: failed('the repository'),
  runs: failed('the runs'),
} as const;

const answer = (read: ReportRead): Promise<ReportRead> => Promise.resolve(read);

const noop = (): void => undefined;

/** A read held until the test lets it land. */
const holder = (): Readonly<{
  promise: Promise<ReportRead>;
  release: (read: ReportRead) => void;
}> => {
  const mut_release: { run: (read: ReportRead) => void } = { run: noop };

  const promise = new Promise<ReportRead>((resolve) => {
    mut_release.run = resolve;
  });

  return {
    promise,
    release: (read) => {
      mut_release.run(read);
    },
  };
};

/** Settles every promise already queued. */
const flush = async (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const setup = (
  read: (n: number, onBudget: Parameters<ReadReport>[2]) => Promise<ReportRead>,
): Readonly<{
  store: ReturnType<typeof createReportStore>;
  timers: ReturnType<typeof manualTimers>;
  setToken: (next: StoredToken | undefined) => void;
  setVisible: (visible: boolean) => void;
  reads: () => number;
  stop: () => void;
}> => {
  const timers = manualTimers();

  const [token, setToken] = createState<StoredToken | undefined>(undefined);

  let mut_visible = true;

  let mut_onChange: (() => void) | undefined = undefined;

  let mut_reads = 0;

  const store = createReportStore({
    token,
    timers,
    isVisible: () => mut_visible,
    watchVisibility: (onChange) => {
      mut_onChange = onChange;

      return noop;
    },
    read: async (_token, _now, onBudget) => {
      mut_reads += 1;

      return read(mut_reads, onBudget);
    },
  });

  const stop = store.start();

  return {
    store,
    timers,
    setToken,
    setVisible: (visible) => {
      mut_visible = visible;

      mut_onChange?.();
    },
    reads: () => mut_reads,
    stop,
  };
};
