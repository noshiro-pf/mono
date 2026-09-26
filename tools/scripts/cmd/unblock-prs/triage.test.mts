import { orderCandidates } from './triage.mjs';
import { type PullRequest } from './types.mjs';

describe(orderCandidates, () => {
  test('takes the lowest number first', () => {
    assert.deepStrictEqual(
      numbers(
        orderCandidates(
          [pullRequest({ number: 3 }), pullRequest({ number: 1 })],
          {
            defaultBranch: 'main',
            demoted: new Map(),
          },
        ),
      ),
      [1, 3],
    );
  });

  test('puts what GitHub calls conflicting after the rest, and the release after that', () => {
    assert.deepStrictEqual(
      numbers(
        orderCandidates(
          [
            pullRequest({
              number: 1,
              headRefName: 'changeset-release/main',
            }),
            pullRequest({ number: 2, mergeStateStatus: 'DIRTY' }),
            pullRequest({ number: 3 }),
          ],
          { defaultBranch: 'main', demoted: new Map() },
        ),
      ),
      [3, 2, 1],
    );
  });

  // Last of all, the release included: the release is known to be able to
  // merge, and this one is known to have sat green without merging.
  test('puts a pull request that sat green without merging last', () => {
    assert.deepStrictEqual(
      numbers(
        orderCandidates(
          [
            pullRequest({ number: 1 }),
            pullRequest({
              number: 2,
              headRefName: 'changeset-release/main',
            }),
            pullRequest({ number: 3, mergeStateStatus: 'DIRTY' }),
            pullRequest({ number: 4 }),
          ],
          { defaultBranch: 'main', demoted: new Map([[1, 'a'.repeat(40)]]) },
        ),
      ),
      [4, 3, 2, 1],
    );
  });

  test('forgets the demotion once someone else has pushed', () => {
    assert.deepStrictEqual(
      numbers(
        orderCandidates(
          [
            pullRequest({ number: 1, headRefOid: 'c'.repeat(40) }),
            pullRequest({ number: 2 }),
          ],
          { defaultBranch: 'main', demoted: new Map([[1, 'a'.repeat(40)]]) },
        ),
      ),
      [1, 2],
    );
  });
});

const numbers = (prs: readonly PullRequest[]): readonly number[] =>
  prs.map((pr) => pr.number);

const pullRequest = (
  fields: Partial<PullRequest> & Readonly<{ number: number }>,
): PullRequest =>
  ({
    title: `pull request #${fields.number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${fields.number}`,
    headRefOid: 'a'.repeat(40),
    baseRefName: 'main',
    isDraft: false,
    mergeStateStatus: 'BEHIND',
    autoMergeRequest: {},
    labels: [{ name: 'merge-queued' }],
    ...fields,
  }) as const;
