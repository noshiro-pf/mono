import { Result } from 'ts-data-forge';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import {
  cancelRun,
  deleteRun,
  dispatchWorkflow,
  readCommitTree,
  readPullRequestNow,
  rerunFailedJobs,
} from './rest-worker.mjs';

const HEAD = 'c'.repeat(40);

describe(readPullRequestNow, () => {
  test('reads whether it is open, its node, head, base and labels', async () => {
    const { transport } = recordedTransport({
      '/repos/o/n/pulls/5': ok({
        state: 'open',
        node_id: 'PR_5',
        head: { sha: HEAD },
        base: { ref: 'main' },
        labels: [{ name: 'merge-queued' }, { name: 'skip-ci' }],
      }),
    });

    assert.deepStrictEqual(
      await readPullRequestNow(
        { transport, owner: 'o', name: 'n', token: 'token' },
        5,
      ),
      Result.ok({
        open: true,
        nodeId: 'PR_5',
        headSha: HEAD,
        baseRef: 'main',
        labels: ['merge-queued', 'skip-ci'],
      }),
    );
  });
});

describe(rerunFailedJobs, () => {
  test('asks for the failed jobs of the run, and passes a refusal on', async () => {
    const { transport, sent } = recordedTransport({
      'POST /repos/o/n/actions/runs/7/rerun-failed-jobs': ok(null),
      'POST /repos/o/n/actions/runs/8/rerun-failed-jobs': status(
        403,
        'past the re-run window',
      ),
    });

    const context = {
      transport,
      owner: 'o',
      name: 'n',
      token: 'token',
    } as const;

    assert.isTrue(Result.isOk(await rerunFailedJobs(context, 7)));

    assert.isTrue(Result.isErr(await rerunFailedJobs(context, 8)));

    assert.strictEqual(sent.length, 2);
  });
});

describe('the queue layers’ writes', () => {
  test('cancel, delete and dispatch runs, and read a commit’s tree', async () => {
    const { transport, sent } = recordedTransport({
      'POST /repos/o/n/actions/runs/7/cancel': ok(null),
      'DELETE /repos/o/n/actions/runs/7': ok(null),
      'POST /repos/o/n/actions/workflows/code-check.yml/dispatches': ok(null),
      [`/repos/o/n/git/commits/${HEAD}`]: ok({ tree: { sha: 'tree' } }),
    });

    const context = {
      transport,
      owner: 'o',
      name: 'n',
      token: 'token',
    } as const;

    assert.isTrue(Result.isOk(await cancelRun(context, 7)));

    assert.isTrue(Result.isOk(await deleteRun(context, 7)));

    assert.isTrue(
      Result.isOk(
        await dispatchWorkflow(context, 'code-check.yml', 'queue/pr-5'),
      ),
    );

    assert.deepStrictEqual(
      await readCommitTree(context, HEAD),
      Result.ok('tree'),
    );

    assert.strictEqual(sent.length, 4);
  });
});
