import {
  decideStart,
  parseStartIssueArgs,
  type IssueFacts,
} from './start-issue.mjs';

describe(decideStart, () => {
  test('starts an open issue nobody has started', () => {
    assert.deepStrictEqual(decideStart(facts({}), false), {
      kind: 'start',
      removePlanned: false,
    });
  });

  test('takes planned off as it starts one', () => {
    assert.deepStrictEqual(
      decideStart(facts({ labels: [label('bug'), label('Planned')] }), false),
      { kind: 'start', removePlanned: true },
    );
  });

  test('refuses one already labelled in-progress, unless forced', () => {
    assert.deepStrictEqual(
      decideStart(facts({ labels: [label('in-progress')] }), false),
      {
        kind: 'refuse',
        reason: 'it is already labelled in-progress',
        overridable: true,
      },
    );

    assert.deepStrictEqual(
      decideStart(facts({ labels: [label('in-progress')] }), true),
      { kind: 'start', removePlanned: false },
    );
  });

  test('refuses one an open pull request closes, unless forced', () => {
    assert.deepStrictEqual(decideStart(facts({ closers: [12, 15] }), false), {
      kind: 'refuse',
      reason: 'open pull request #12, #15 closes it',
      overridable: true,
    });

    assert.deepStrictEqual(decideStart(facts({ closers: [12] }), true), {
      kind: 'start',
      removePlanned: false,
    });
  });

  test('refuses what is closed or a pull request, forced or not', () => {
    assert.deepStrictEqual(decideStart(facts({ open: false }), true), {
      kind: 'refuse',
      reason: 'it is closed',
      overridable: false,
    });

    assert.deepStrictEqual(decideStart(facts({ pullRequest: true }), true), {
      kind: 'refuse',
      reason: 'it is a pull request, not an issue',
      overridable: false,
    });
  });
});

describe(parseStartIssueArgs, () => {
  test('reads the number, with or without #, and the mode', () => {
    assert.deepStrictEqual(parseStartIssueArgs(['--', '#2701']), {
      number: 2701,
      mode: 'start',
    });

    assert.deepStrictEqual(parseStartIssueArgs(['2701', '--force']), {
      number: 2701,
      mode: 'force',
    });

    assert.deepStrictEqual(parseStartIssueArgs(['--release', '2701']), {
      number: 2701,
      mode: 'release',
    });
  });

  test('says what is wrong with the command line', () => {
    assert.strictEqual(parseStartIssueArgs([]), 'name the issue by its number');

    assert.strictEqual(
      parseStartIssueArgs(['1', '2']),
      'unexpected argument: 2',
    );

    assert.strictEqual(
      parseStartIssueArgs(['1', '--by']),
      'unknown option: --by',
    );

    assert.strictEqual(
      parseStartIssueArgs(['1', '--force', '--release']),
      '--force and --release do not go together',
    );
  });
});

const label = (name: string): Readonly<{ name: string }> => ({ name }) as const;

const facts = (overrides: Partial<IssueFacts>): IssueFacts =>
  ({
    open: true,
    pullRequest: false,
    labels: [],
    closers: [],
    ...overrides,
  }) as const;
