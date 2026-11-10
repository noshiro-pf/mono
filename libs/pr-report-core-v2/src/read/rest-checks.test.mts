import { Result } from 'ts-data-forge';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import { readHeadChecks, readsAnnotations } from './rest-checks.mjs';
import type { ReadContext } from './transport.mjs';

const SHA = 'a'.repeat(40);

const contextOf = (
  routes: Parameters<typeof recordedTransport>[0],
): ReadContext =>
  ({
    transport: recordedTransport(routes).transport,
    owner: 'o',
    name: 'n',
    token: 'token',
  }) as const;

const routesOf = (
  overrides: Parameters<typeof recordedTransport>[0] = {},
): Parameters<typeof recordedTransport>[0] =>
  ({
    [`/repos/o/n/commits/${SHA}/check-runs?filter=all&per_page=100`]: ok({
      check_runs: [
        {
          id: 2,
          name: 'code-check (lint)',
          status: 'completed',
          conclusion: 'failure',
          started_at: '2026-11-10T00:00:00Z',
          completed_at: '2026-11-10T00:05:00Z',
          html_url: 'https://github.com/o/n/runs/2',
          check_suite: { id: 20 },
        },
        {
          id: 3,
          name: 'code-check-result / result',
          status: 'in_progress',
          conclusion: null,
          started_at: '2026-11-10T00:06:00Z',
          completed_at: null,
          html_url: null,
          check_suite: { id: 20 },
        },
      ],
    }),
    '/repos/o/n/check-runs/2/annotations?per_page=100': ok([
      { title: 'Process completed with exit code 1.' },
      { title: null },
    ]),
    [`/repos/o/n/commits/${SHA}/status?per_page=100`]: ok({
      statuses: [
        { context: 'no-skip-ci-label', state: 'SUCCESS', target_url: null },
      ],
    }),
    [`/repos/o/n/actions/runs?head_sha=${SHA}&per_page=100`]: ok({
      workflow_runs: [
        {
          id: 200,
          check_suite_id: 20,
          workflow_id: 7,
          status: 'in_progress',
          run_started_at: '2026-11-10T00:00:00Z',
          head_branch: 'feature',
        },
      ],
    }),
    ...overrides,
  }) as const;

describe(readHeadChecks, () => {
  test('reads the runs, the titles of a failed run, the statuses and the rounds', async () => {
    const read = Result.unwrapThrow(
      await readHeadChecks(contextOf(routesOf()), SHA),
    );

    assert.deepStrictEqual(read, {
      sha: SHA,
      runs: [
        {
          name: 'code-check (lint)',
          status: 'completed',
          conclusion: 'failure',
          checkSuiteId: 20,
          id: 2,
          startedAt: '2026-11-10T00:00:00Z',
          completedAt: '2026-11-10T00:05:00Z',
          annotationTitles: Result.ok([
            'Process completed with exit code 1.',
            '',
          ]),
          url: 'https://github.com/o/n/runs/2',
        },
        {
          name: 'code-check-result / result',
          status: 'in_progress',
          conclusion: undefined,
          checkSuiteId: 20,
          id: 3,
          startedAt: '2026-11-10T00:06:00Z',
          completedAt: undefined,
          annotationTitles: undefined,
          url: '',
        },
      ],
      statuses: [
        { context: 'no-skip-ci-label', state: 'success', url: undefined },
      ],
      rounds: [
        {
          checkSuiteId: 20,
          runId: 200,
          workflowId: 7,
          completed: false,
          attemptStartedAt: '2026-11-10T00:00:00Z',
          headBranch: 'feature',
        },
      ],
    });
  });

  // Read as nothing, a part that failed would make a red head look not started.
  test('is unread when any part is; an unread annotation list stays on its run', async () => {
    const unread = await readHeadChecks(
      contextOf(
        routesOf({
          [`/repos/o/n/actions/runs?head_sha=${SHA}&per_page=100`]: status(
            502,
            'bad gateway',
          ),
        }),
      ),
      SHA,
    );

    assert.strictEqual(
      Result.isErr(unread) ? unread.value.kind : undefined,
      'unavailable',
    );

    const titles = Result.unwrapThrow(
      await readHeadChecks(
        contextOf(
          routesOf({
            '/repos/o/n/check-runs/2/annotations?per_page=100': status(
              403,
              'forbidden',
            ),
          }),
        ),
        SHA,
      ),
    ).runs[0]?.annotationTitles;

    assert.isTrue(titles !== undefined && Result.isErr(titles));
  });
});

describe(readsAnnotations, () => {
  test('reads them only for a run that completed without passing', () => {
    assert.isTrue(readsAnnotations('completed', 'failure'));

    assert.isTrue(readsAnnotations('completed', 'cancelled'));

    assert.isFalse(readsAnnotations('completed', 'success'));

    assert.isFalse(readsAnnotations('completed', 'skipped'));

    assert.isFalse(readsAnnotations('in_progress', undefined));
  });
});
