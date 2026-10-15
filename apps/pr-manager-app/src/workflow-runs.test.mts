import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { REPORT_SOURCE } from './constants.mjs';
import {
  actionsQueryUrl,
  loadWorkflowRuns,
  RUN_STATES,
  type RestFetch,
  type RestFetchInit,
} from './workflow-runs.mjs';

describe(loadWorkflowRuns, () => {
  test('asks for each state, with the token, and lists what they found newest first', async () => {
    const { fetchImpl, sent } = answering({
      in_progress: page([run({ id: 1, created_at: '2026-10-15T10:00:00Z' })]),
      queued: page([
        run({
          id: 2,
          name: 'code-check',
          created_at: '2026-10-15T11:00:00Z',
        }),
      ]),
      waiting: page([run({ id: 3, created_at: '2026-10-15T09:00:00Z' })]),
    });

    const loaded = await loadWorkflowRuns(REPORT_SOURCE, {
      token: 'secret',
      fetchImpl,
    });

    assert.isTrue(Result.isOk(loaded));

    if (Result.isErr(loaded)) {
      return;
    }

    assert.deepStrictEqual(
      sent.map(({ state }) => state).toSorted(),
      RUN_STATES.toSorted(),
    );

    for (const { route, init } of sent) {
      assert.isTrue(
        route.startsWith(
          'https://api.github.com/repos/noshiro-pf/mono/actions/runs?',
        ),
      );

      assert.strictEqual(init.method, 'GET');

      assert.strictEqual(init.headers['Authorization'], 'Bearer secret');

      // The browser revalidates, and a `304` costs nothing.
      assert.strictEqual(init.cache, 'no-cache');
    }

    assert.deepStrictEqual(
      loaded.value.runs.map(({ id, state }) => [id, state]),
      [
        [2, 'queued'],
        [1, 'in_progress'],
        [3, 'waiting'],
      ],
    );

    assert.strictEqual(loaded.value.totalCount, 3);

    assert.deepStrictEqual(loaded.value.runs[0], {
      id: 2,
      workflow: 'code-check',
      title: 'feat: something',
      runNumber: 12,
      url: 'https://github.com/noshiro-pf/mono/actions/runs/2',
      event: 'pull_request',
      branch: 'feat/something',
      actor: 'noshiro-pf',
      state: 'queued',
      createdAt: '2026-10-15T11:00:00Z',
    });
  });

  test('lists a run met under two states once', async () => {
    const { fetchImpl } = answering({
      queued: page([run({ id: 5 })]),
      in_progress: page([run({ id: 5 })]),
    });

    const loaded = await loadWorkflowRuns(REPORT_SOURCE, {
      token: 'secret',
      fetchImpl,
    });

    assert.isTrue(Result.isOk(loaded));

    if (Result.isOk(loaded)) {
      assert.deepStrictEqual(
        loaded.value.runs.map(({ id }) => id),
        [5],
      );
    }
  });

  test('counts what GitHub has beyond the page', async () => {
    const { fetchImpl } = answering({
      in_progress: { total_count: 150, workflow_runs: [run({ id: 1 })] },
    });

    const loaded = await loadWorkflowRuns(REPORT_SOURCE, {
      token: 'secret',
      fetchImpl,
    });

    assert.isTrue(Result.isOk(loaded));

    if (!Result.isOk(loaded)) {
      return;
    }

    assert.strictEqual(loaded.value.totalCount, 150);

    assert.strictEqual(loaded.value.runs.length, 1);
  });

  test('reads a run with no workflow name, branch or actor', async () => {
    const { fetchImpl } = answering({
      in_progress: page([
        run({ id: 1, name: null, head_branch: null, actor: null }),
      ]),
    });

    const loaded = await loadWorkflowRuns(REPORT_SOURCE, {
      token: 'secret',
      fetchImpl,
    });

    assert.isTrue(Result.isOk(loaded));

    if (Result.isErr(loaded)) {
      return;
    }

    const [first] = loaded.value.runs;

    assert.strictEqual(first?.workflow, '');

    assert.isUndefined(first?.branch);

    assert.strictEqual(first?.actor, 'ghost');
  });

  test('fails when one state is refused', async () => {
    const loaded = await loadWorkflowRuns(REPORT_SOURCE, {
      token: 'secret',
      fetchImpl: refusingStale,
    });

    assert.isTrue(Result.isErr(loaded));

    if (Result.isErr(loaded)) {
      assert.include(loaded.value, 'would not accept the token');
    }
  });

  test('says when the REST budget is spent', async () => {
    const loaded = await loadWorkflowRuns(REPORT_SOURCE, {
      token: 'secret',
      fetchImpl: spent,
    });

    assert.isTrue(Result.isErr(loaded));

    if (Result.isErr(loaded)) {
      assert.include(loaded.value, 'REST rate limit');
    }
  });

  test('fails on an answer of another shape', async () => {
    const { fetchImpl } = answering({
      queued: { total_count: 1, workflow_runs: [{ id: 'one' }] },
    });

    const loaded = await loadWorkflowRuns(REPORT_SOURCE, {
      token: 'secret',
      fetchImpl,
    });

    assert.isTrue(Result.isErr(loaded));

    if (Result.isErr(loaded)) {
      assert.include(loaded.value, 'not the shape this page expects');
    }
  });

  test('fails without the network, rather than throwing', async () => {
    const loaded = await loadWorkflowRuns(REPORT_SOURCE, {
      token: 'secret',
      fetchImpl: offline,
    });

    assert.isTrue(Result.isErr(loaded));

    if (Result.isErr(loaded)) {
      assert.include(loaded.value, 'Could not reach the GitHub API');
    }
  });
});

describe(actionsQueryUrl, () => {
  test('is the Actions tab filtered to the states listed', () => {
    assert.strictEqual(
      actionsQueryUrl(REPORT_SOURCE),
      'https://github.com/noshiro-pf/mono/actions?query=is%3Ain_progress+is%3Aqueued+is%3Awaiting+is%3Aaction_required+is%3Aneutral+is%3Astale',
    );
  });
});

type Sent = Readonly<{ route: string; state: string; init: RestFetchInit }>;

/** Answers each state with what `pages` give for it, and an empty page else. */
const answering = (
  pages: Partial<ReadonlyRecord<string, unknown>>,
): Readonly<{ fetchImpl: RestFetch; sent: readonly Sent[] }> => {
  const mut_sent: Sent[] = [];

  const fetchImpl: RestFetch = (route, init) => {
    const state = stateOf(route);

    mut_sent.push({ route, state, init });

    return Promise.resolve(Response.json(pages[state] ?? page([])));
  };

  return { fetchImpl, sent: mut_sent };
};

const stateOf = (route: string): string => {
  const url = new URL(route);

  return url.searchParams.get('status') ?? '';
};

const refusingStale: RestFetch = (route) =>
  Promise.resolve(
    stateOf(route) === 'stale'
      ? new Response('', { status: 401, statusText: 'Unauthorized' })
      : Response.json(page([])),
  );

const spent: RestFetch = () =>
  Promise.resolve(
    new Response('', {
      status: 403,
      statusText: 'Forbidden',
      headers: { 'x-ratelimit-remaining': '0' },
    }),
  );

const offline: RestFetch = () =>
  Promise.reject(new TypeError('Failed to fetch'));

const page = (
  runs: readonly unknown[],
): Readonly<{ total_count: number; workflow_runs: readonly unknown[] }> =>
  ({ total_count: runs.length, workflow_runs: runs }) as const;

const run = (
  overrides: ReadonlyRecord<string, unknown> & Readonly<{ id: number }>,
): ReadonlyRecord<string, unknown> =>
  ({
    name: 'CI',
    display_title: 'feat: something',
    run_number: 12,
    html_url: `https://github.com/noshiro-pf/mono/actions/runs/${overrides.id}`,
    event: 'pull_request',
    head_branch: 'feat/something',
    created_at: '2026-10-15T10:00:00Z',
    actor: { login: 'noshiro-pf' },
    ...overrides,
  }) as const;
