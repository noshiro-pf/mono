import { decideQueue, type QueueDecision } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import { issue, pull, snapshot } from '../../../test/index.mjs';
import { issueGraphOf } from './issue-graph.mjs';
import { issueRowOf, issueTitlesOf } from './issue-row.mjs';

describe(issueGraphOf, () => {
  test('draws what a drawn issue waits on, and the pull request closing it', () => {
    const from = snapshot(
      [
        pull(10, {
          closingIssues: Result.ok([
            { number: 2, title: 'Second', url: '', state: 'open' },
          ]),
        }),
      ],
      [
        issue(1, { title: 'First' }),
        issue(2, { title: 'Second', body: 'Start-After: #1' }),
      ],
    );

    const decision = decided(from);

    const rows = new Map(
      Result.unwrapThrow(decision.issues).map((d) => [
        d.facts.number,
        issueRowOf(d, issueTitlesOf(from), 0),
      ]),
    );

    const second = rows.get(2);

    assert.isDefined(second);

    const g = issueGraphOf([second], rows, decision.pullRequests, from);

    assert.deepStrictEqual(
      g.nodes.map(({ id, extra, state }) => [id, extra, state]),
      [
        ['i2', false, 'waiting'],
        ['i1', true, 'free'],
        ['p10', false, 'pull'],
      ],
    );

    assert.deepStrictEqual(g.edges, [
      { from: 'i1', to: 'i2', kind: 'waits' },
      { from: 'i2', to: 'p10', kind: 'closes' },
    ]);
  });

  test('draws an open pull request a drawn issue waits on as one', () => {
    const from = snapshot(
      [pull(10)],
      [issue(2, { title: 'Second', body: 'Start-After: #10' })],
    );

    const decision = decided(from);

    const rows = new Map(
      Result.unwrapThrow(decision.issues).map((d) => [
        d.facts.number,
        issueRowOf(d, issueTitlesOf(from), 0),
      ]),
    );

    const second = rows.get(2);

    assert.isDefined(second);

    const g = issueGraphOf([second], rows, decision.pullRequests, from);

    assert.deepStrictEqual(
      g.nodes.map(({ id, kind }) => [id, kind]),
      [
        ['i2', 'issue'],
        ['p10', 'pull'],
      ],
    );

    assert.deepStrictEqual(g.edges, [{ from: 'p10', to: 'i2', kind: 'waits' }]);
  });
});

const decided = (from: ReturnType<typeof snapshot>): QueueDecision =>
  Result.unwrapThrow(
    decideQueue(from, { nowEpochMs: 0, demoted: new Set<number>() }),
  );
