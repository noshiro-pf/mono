import { ok, readContextOf, recordedTransport } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { readRunningWorkflows, RUNNING_STATES } from './workflow-runs.mjs';

describe(readRunningWorkflows, () => {
  test('reads one page per state and labels each run with its state', async () => {
    const { transport, sent } = recordedTransport(
      Object.fromEntries(
        RUNNING_STATES.map((state) => [
          `/repos/o/n/actions/runs?status=${state}&per_page=100`,
          ok({
            total_count:
              state === 'queued'
                ? 250
                : state === 'in_progress' || state === 'action_required'
                  ? 1
                  : 0,
            workflow_runs:
              state === 'action_required'
                ? [run(2, 'completed', '2026-11-10T02:00:00Z')]
                : state === 'in_progress'
                  ? [run(1, 'in_progress', '2026-11-10T01:00:00Z')]
                  : [],
          }),
        ]),
      ),
    );

    const read = await readRunningWorkflows(
      readContextOf({ transport, owner: 'o', name: 'n', token: 't' }),
    );

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(
      read.value.runs.map(({ id, status }) => [id, status]),
      [
        [2, 'action_required'],
        [1, 'in_progress'],
      ],
    );

    assert.strictEqual(sent.length, RUNNING_STATES.length);

    // 250 queued and none listed: the page did not hold the state's list.
    assert.isFalse(read.value.complete);
  });
});

const run = (
  id: number,
  status: string,
  startedAt: string,
): ReadonlyRecord<string, unknown> =>
  ({
    id,
    name: 'code-check',
    display_title: `run ${id}`,
    run_number: id,
    event: 'push',
    head_branch: 'main',
    status,
    run_started_at: startedAt,
    created_at: startedAt,
    html_url: `https://github.com/o/n/actions/runs/${id}`,
    actor: { login: 'someone' },
  }) as const;
