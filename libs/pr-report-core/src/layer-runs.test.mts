import { Arr } from 'ts-data-forge';
import {
  cancelledTooOften,
  layerRunsRequest,
  layerRunsVerdict,
  MAX_DISPATCHES,
  type DispatchedRun,
} from './layer-runs.mjs';

describe(layerRunsVerdict, () => {
  const WORKFLOWS = ['code-check.yml', 'style-check.yml'] as const;

  test('is running while a latest run is going', () => {
    const verdict = layerRunsVerdict(
      [run(1, 'code-check.yml', 'success'), run(2, 'style-check.yml', null)],
      WORKFLOWS,
    );

    // Whether its jobs have all started is not read here.
    assert.deepStrictEqual(verdict.status, { kind: 'running', queued: true });

    assert.deepStrictEqual(
      verdict.latest.map(({ workflow, run: latest }) => [workflow, latest?.id]),
      [
        ['code-check.yml', 1],
        ['style-check.yml', 2],
      ],
    );
  });

  test('is green once the latest run of every workflow has finished', () => {
    assert.strictEqual(
      layerRunsVerdict(
        [
          run(1, 'code-check.yml', 'success'),
          run(2, 'style-check.yml', 'skipped'),
        ],
        WORKFLOWS,
      ).status.kind,
      'green',
    );
  });

  test('reads only the latest run of each workflow', () => {
    assert.strictEqual(
      layerRunsVerdict(
        [
          run(1, 'code-check.yml', 'cancelled'),
          run(2, 'style-check.yml', 'success'),
          run(3, 'code-check.yml', 'success'),
          run(4, 'style-check.yml', 'failure'),
        ].toReversed(),
        WORKFLOWS,
      ).status.kind,
      'red',
    );

    assert.strictEqual(
      layerRunsVerdict(
        [
          run(1, 'code-check.yml', 'failure'),
          run(2, 'style-check.yml', 'success'),
          run(3, 'code-check.yml', 'success'),
        ],
        WORKFLOWS,
      ).status.kind,
      'green',
    );
  });

  test('is red once a latest run failed, naming the first, whatever else is going or missing', () => {
    for (const conclusion of [
      'failure',
      'timed_out',
      'startup_failure',
      'action_required',
    ] as const) {
      const verdict = layerRunsVerdict(
        [run(1, 'style-check.yml', conclusion)],
        WORKFLOWS,
      );

      assert.deepStrictEqual(verdict.status, {
        kind: 'red',
        name: 'style-check.yml',
        link: 'https://github.com/runs/1',
      });
    }
  });

  test('is not dispatched while a workflow has no run, or a cancelled one', () => {
    const none = layerRunsVerdict([], WORKFLOWS);

    assert.strictEqual(none.status.kind, 'not-dispatched');

    assert.deepStrictEqual(none.missing, WORKFLOWS);

    const cancelled = layerRunsVerdict(
      [
        run(1, 'code-check.yml', 'success'),
        run(2, 'style-check.yml', 'cancelled'),
      ],
      WORKFLOWS,
    );

    assert.strictEqual(cancelled.status.kind, 'not-dispatched');

    assert.deepStrictEqual(cancelled.missing, ['style-check.yml']);

    assert.isFalse(cancelled.cancelledTooOften);
  });

  test('says when a workflow to dispatch again has been cancelled too often', () => {
    const verdict = layerRunsVerdict(
      Arr.seq(MAX_DISPATCHES).map((index) =>
        run(index, 'code-check.yml', 'cancelled'),
      ),
      ['code-check.yml'],
    );

    assert.strictEqual(verdict.status.kind, 'not-dispatched');

    assert.isTrue(verdict.cancelledTooOften);

    // Only a workflow still to dispatch counts: one run again by hand after the
    // worker gave up, and passed, does not, whatever cancelled it before.
    const passed = layerRunsVerdict(
      [
        ...Arr.seq(MAX_DISPATCHES).map((index) =>
          run(index, 'code-check.yml', 'cancelled'),
        ),
        run(MAX_DISPATCHES, 'code-check.yml', 'success'),
        run(MAX_DISPATCHES + 1, 'style-check.yml', 'cancelled'),
      ],
      ['code-check.yml', 'style-check.yml'],
    );

    assert.deepStrictEqual(passed.missing, ['style-check.yml']);

    assert.isFalse(passed.cancelledTooOften);
  });
});

describe(cancelledTooOften, () => {
  test('is a workflow cancelled as often as it may be dispatched', () => {
    const cancelled: readonly string[] = Array.from(
      { length: MAX_DISPATCHES },
      () => 'cancelled',
    );

    const onceLess = Arr.tail(cancelled);

    assert.isTrue(cancelledTooOften(cancelled));

    assert.isFalse(cancelledTooOften(onceLess));

    assert.isFalse(cancelledTooOften([...onceLess, 'success', null]));
  });
});

/** A run of `workflow`; a `null` conclusion is one still going. */
const run = (
  id: number,
  workflow: string,
  conclusion: string | null,
): DispatchedRun =>
  ({
    id,
    path: `.github/workflows/${workflow}`,
    status:
      conclusion === null ? ('in_progress' as const) : ('completed' as const),
    conclusion,
    html_url: `https://github.com/runs/${id}`,
  }) as const;

describe(layerRunsRequest, () => {
  test('asks for the dispatched runs on the commit, all on one page', () => {
    assert.deepStrictEqual(layerRunsRequest('tip'), {
      route: '/actions/runs',
      query: { head_sha: 'tip', event: 'workflow_dispatch', per_page: '100' },
    });
  });
});
