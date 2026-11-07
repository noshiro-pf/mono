import { Result } from 'ts-data-forge';
import type { BranchRulesGet } from './branch-rules.mjs';
import { readWorkflowRound, readWorkflowRounds } from './workflow-rounds.mjs';

/** A `get` answering with one body, whatever is asked. */
const answerWith =
  (body: unknown): BranchRulesGet =>
  (_path, schema) => {
    const checked = schema.validate(body);

    return Promise.resolve(
      Result.isErr(checked)
        ? Result.err('not the shape expected')
        : Result.ok(checked.value),
    );
  };

describe(readWorkflowRounds, () => {
  test('maps each suite to its workflow run, with when its latest attempt began', async () => {
    const rounds = await readWorkflowRounds(
      SHA_A,
      answerWith({
        total_count: 2,
        workflow_runs: [
          {
            check_suite_id: 1,
            workflow_id: 10,
            status: 'in_progress',
            run_started_at: '2026-11-07T10:30:00Z',
          },
          {
            check_suite_id: 2,
            workflow_id: 20,
            status: 'completed',
            run_started_at: '2026-11-07T09:00:00Z',
          },
        ],
      }),
    );

    assert.isTrue(Result.isOk(rounds));

    assert.deepStrictEqual(Array.from(rounds.value), [
      [
        1,
        {
          workflowId: 10,
          completed: false,
          attemptStartedAt: '2026-11-07T10:30:00Z',
        },
      ],
      [
        2,
        {
          workflowId: 20,
          completed: true,
          attemptStartedAt: '2026-11-07T09:00:00Z',
        },
      ],
    ]);
  });

  test('fails rather than answer with part of the runs', async () => {
    const rounds = await readWorkflowRounds(SHA_A, () =>
      Promise.resolve(Result.err('refused')),
    );

    assert.isTrue(Result.isErr(rounds));
  });
});

describe('readWorkflowRounds over several pages', () => {
  test('reads every page the count says there are', async () => {
    const mut_asked: string[] = [];

    const rounds = await readWorkflowRounds(SHA_A, (path, schema) => {
      mut_asked.push(path);

      const page = path.endsWith('&page=2') ? 2 : 1;

      const checked = schema.validate({
        total_count: 150,
        workflow_runs: [
          {
            check_suite_id: page,
            workflow_id: page,
            status: 'completed',
            run_started_at: null,
          },
        ],
      });

      return Promise.resolve(
        Result.isErr(checked)
          ? Result.err('not the shape expected')
          : Result.ok(checked.value),
      );
    });

    assert.lengthOf(mut_asked, 2);

    assert.isTrue(Result.isOk(rounds));

    assert.deepStrictEqual(Array.from(rounds.value.keys()), [1, 2]);
  });
});

describe('readWorkflowRounds of what is not a sha', () => {
  test('asks nothing, and fails', async () => {
    const mut_asked: string[] = [];

    const rounds = await readWorkflowRounds('main&x=1', (path) => {
      mut_asked.push(path);

      return Promise.resolve(Result.err('not asked'));
    });

    assert.isTrue(Result.isErr(rounds));

    assert.deepStrictEqual(mut_asked, []);
  });
});

describe(readWorkflowRound, () => {
  test('reads one run as its suite and round', async () => {
    const mut_asked: string[] = [];

    const read = await readWorkflowRound(100, (path, schema) => {
      mut_asked.push(path);

      const checked = schema.validate({
        check_suite_id: 1,
        workflow_id: 7,
        status: 'queued',
        run_started_at: '2026-11-07T10:30:00Z',
      });

      return Promise.resolve(
        Result.isErr(checked)
          ? Result.err('not the shape expected')
          : Result.ok(checked.value),
      );
    });

    assert.deepStrictEqual(mut_asked, ['/actions/runs/100']);

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value, [
      1,
      {
        workflowId: 7,
        completed: false,
        attemptStartedAt: '2026-11-07T10:30:00Z',
      },
    ]);
  });

  test('fails when the read does', async () => {
    const read = await readWorkflowRound(100, () =>
      Promise.resolve(Result.err('refused')),
    );

    assert.isTrue(Result.isErr(read));
  });
});

const SHA_A = 'a'.repeat(40);
