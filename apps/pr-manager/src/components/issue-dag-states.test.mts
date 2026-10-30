import type { StrictPick } from 'ts-type-forge';
import type { IssueGraphNode } from '../issue-graph.mjs';
import { describeNode, explainState, markedNote } from './issue-dag-states.mjs';

describe(explainState, () => {
  test('says whether in progress is a pull request or the label', () => {
    assert.strictEqual(
      explainState({ kind: 'issue', state: 'in-progress', marked: 'none' }),
      'an open pull request closes it.',
    );

    assert.match(
      explainState({
        kind: 'issue',
        state: 'in-progress',
        marked: 'in-progress',
      }),
      /^it is labelled in-progress/u,
    );
  });
});

describe(describeNode, () => {
  test('says a label the state does not already say', () => {
    assert.strictEqual(
      describeNode(node({ state: 'blocked', marked: 'planned' })),
      [
        '#1 Issue 1',
        'Waiting: something its Start-After: names is still open.',
        'Labelled planned',
      ].join('\n'),
    );
  });

  test('says nothing more when the state already says it', () => {
    assert.strictEqual(
      describeNode(node({ state: 'planned', marked: 'planned' })),
      [
        '#1 Issue 1',
        'Planned: it is labelled planned, so someone means to start it next.',
      ].join('\n'),
    );
  });
});

const node = (
  overrides: StrictPick<IssueGraphNode, 'marked' | 'state'>,
): IssueGraphNode =>
  ({
    number: 1,
    kind: 'issue',
    title: 'Issue 1',
    url: 'https://github.com/o/r/issues/1',
    priority: 'none',
    pending: false,
    ...overrides,
  }) as const;

describe(markedNote, () => {
  test('names a label only where the state does not say it', () => {
    assert.deepStrictEqual(
      markedNote({ state: 'blocked', marked: 'in-progress' }),
      ['Labelled in-progress'],
    );

    assert.deepStrictEqual(
      markedNote({ state: 'in-progress', marked: 'in-progress' }),
      [],
    );

    assert.deepStrictEqual(markedNote({ state: 'free', marked: 'none' }), []);
  });
});
