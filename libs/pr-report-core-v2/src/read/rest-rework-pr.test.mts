// cspell:ignore Afeature
import { Result } from 'ts-data-forge';
import { graphqlWrite } from './graphql.mjs';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import { readOpenPullRequestOf, readQueueEvents } from './rest-rework-pr.mjs';

const context = (
  routes: Parameters<typeof recordedTransport>[0],
): Readonly<{
  context: Parameters<typeof readQueueEvents>[0];
  sent: ReturnType<typeof recordedTransport>['sent'];
}> => {
  const { transport, sent } = recordedTransport(routes);

  return {
    context: { transport, owner: 'o', name: 'n', token: 'token' },
    sent,
  };
};

describe(readOpenPullRequestOf, () => {
  test('reads the open pull request of this repository’s branch, or none', async () => {
    const pull = {
      number: 5,
      node_id: 'PR_5',
      draft: false,
      labels: [{ name: 'skip-ci' }],
      auto_merge: { merge_method: 'squash' },
    } as const;

    const { context: found } = context({
      '/repos/o/n/pulls?state=open&per_page=1&head=o%3Afeature': ok([pull]),
    });

    const { context: none } = context({
      '/repos/o/n/pulls?state=open&per_page=1&head=o%3Afeature': ok([]),
    });

    assert.deepStrictEqual(
      await Promise.all([
        readOpenPullRequestOf(found, 'feature'),
        readOpenPullRequestOf(none, 'feature'),
      ]),
      [
        Result.ok({
          number: 5,
          nodeId: 'PR_5',
          labels: ['skip-ci'],
          isDraft: false,
          isArmed: true,
        }),
        Result.ok(undefined),
      ],
    );
  });
});

describe(readQueueEvents, () => {
  test('keeps the merge-queued events alone, in the order of their ids', async () => {
    const { context: read } = context({
      '/repos/o/n/issues/5/events?per_page=100': ok([
        { id: 9, event: 'unlabeled', label: { name: 'merge-queued' } },
        { id: 3, event: 'labeled', label: { name: 'merge-queued' } },
        { id: 4, event: 'labeled', label: { name: 'skip-ci' } },
        { id: 5, event: 'closed' },
        { id: 6, event: 'renamed', label: null },
      ]),
    });

    assert.deepStrictEqual(
      await readQueueEvents(read, 5),
      Result.ok([
        { id: 3, event: 'labeled' },
        { id: 9, event: 'unlabeled' },
      ]),
    );
  });
});

describe(graphqlWrite, () => {
  test('sends its own variables alone, and a refusal is refused', async () => {
    const { context: write, sent } = context({
      'graphql:convertPullRequestToDraft': [
        ok({ data: { convertPullRequestToDraft: null } }),
        status(403, 'Forbidden'),
      ],
    });

    const mutation =
      'mutation ($id: ID!) { convertPullRequestToDraft(input: { pullRequestId: $id }) { clientMutationId } }';

    const results = [
      await graphqlWrite(write, 'a draft', mutation, { id: 'PR_5' }),
      await graphqlWrite(write, 'a draft', mutation, { id: 'PR_5' }),
    ] as const;

    assert.deepStrictEqual(
      [results[0], Result.isErr(results[1]) && results[1].value.kind],
      [Result.ok(undefined), 'refused'],
    );

    assert.strictEqual(
      sent[0]?.body,
      JSON.stringify({ query: mutation, variables: { id: 'PR_5' } }),
    );
  });
});
