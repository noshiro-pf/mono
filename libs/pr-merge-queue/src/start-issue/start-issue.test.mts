import type { IssueClaim } from 'pr-report-core';
import {
  decideRelease,
  decideStart,
  parseStartIssueArgs,
  type IssueFacts,
} from './start-issue.mjs';

const ME = 'https://claude.ai/code/session_01me';

const OTHER = 'https://claude.ai/code/session_01other';

describe(decideStart, () => {
  test('starts an open issue nobody has started', () => {
    assert.deepStrictEqual(decideStart(facts({}), start), {
      kind: 'claim',
      removePlanned: false,
    });
  });

  test('takes planned off as it starts one', () => {
    assert.deepStrictEqual(
      decideStart(facts({ labels: [label('bug'), label('Planned')] }), start),
      { kind: 'claim', removePlanned: true },
    );
  });

  test('refuses one someone else claimed, naming them, unless forced', () => {
    assert.deepStrictEqual(
      decideStart(
        facts({
          labels: [label('in-progress')],
          claim: claim({ by: OTHER }),
        }),
        start,
      ),
      {
        kind: 'refuse',
        reason: `${OTHER} started it at 2026-10-12T01:00:00Z`,
        overridable: true,
      },
    );

    assert.deepStrictEqual(
      decideStart(
        facts({
          labels: [label('planned')],
          claim: claim({ by: OTHER, state: 'planned' }),
        }),
        plan,
      ),
      {
        kind: 'refuse',
        reason: `${OTHER} planned it at 2026-10-12T01:00:00Z`,
        overridable: true,
      },
    );

    assert.deepStrictEqual(
      decideStart(
        facts({
          labels: [label('in-progress')],
          claim: claim({ by: OTHER }),
        }),
        { ...start, force: true },
      ),
      { kind: 'claim', removePlanned: false },
    );
  });

  test('lets the claimant claim it again, or start what it planned', () => {
    assert.deepStrictEqual(
      decideStart(
        facts({ labels: [label('in-progress')], claim: claim({}) }),
        start,
      ),
      { kind: 'claim', removePlanned: false },
    );

    assert.deepStrictEqual(
      decideStart(
        facts({
          labels: [label('planned')],
          claim: claim({ state: 'planned' }),
        }),
        start,
      ),
      { kind: 'claim', removePlanned: true },
    );

    assert.deepStrictEqual(
      decideStart(
        facts({
          labels: [label('planned')],
          claim: claim({ state: 'planned' }),
        }),
        plan,
      ),
      { kind: 'claim', removePlanned: false },
    );
  });

  test('refuses one labelled in-progress by nobody it can name, unless forced', () => {
    assert.deepStrictEqual(
      decideStart(facts({ labels: [label('in-progress')] }), start),
      {
        kind: 'refuse',
        reason: 'it is already labelled in-progress',
        overridable: true,
      },
    );

    assert.deepStrictEqual(
      decideStart(facts({ labels: [label('in-progress')] }), {
        ...start,
        force: true,
      }),
      { kind: 'claim', removePlanned: false },
    );
  });

  test('plans one a person labelled planned only when forced', () => {
    assert.deepStrictEqual(
      decideStart(facts({ labels: [label('planned')] }), plan),
      {
        kind: 'refuse',
        reason: 'it is already labelled planned',
        overridable: true,
      },
    );

    assert.deepStrictEqual(
      decideStart(facts({ labels: [label('planned')] }), {
        ...plan,
        force: true,
      }),
      { kind: 'claim', removePlanned: false },
    );
  });

  test('lets the claimant plan again once its plan has lapsed', () => {
    assert.deepStrictEqual(
      decideStart(
        facts({ labels: [label('planned')], lastClaimant: ME }),
        plan,
      ),
      { kind: 'claim', removePlanned: false },
    );

    assert.deepStrictEqual(
      decideStart(
        facts({ labels: [label('planned')], lastClaimant: OTHER }),
        plan,
      ),
      {
        kind: 'refuse',
        reason: 'it is already labelled planned',
        overridable: true,
      },
    );
  });

  test('does not plan what is started, forced or not', () => {
    assert.deepStrictEqual(
      decideStart(facts({ labels: [label('in-progress')], claim: claim({}) }), {
        ...plan,
        force: true,
      }),
      {
        kind: 'refuse',
        reason:
          'it is labelled in-progress: started, not planned (--release takes that off first)',
        overridable: false,
      },
    );
  });

  test('refuses one an open pull request closes, unless forced', () => {
    assert.deepStrictEqual(decideStart(facts({ closers: [12, 15] }), start), {
      kind: 'refuse',
      reason: 'open pull request #12, #15 closes it',
      overridable: true,
    });

    assert.deepStrictEqual(
      decideStart(facts({ closers: [12] }), { ...start, force: true }),
      { kind: 'claim', removePlanned: false },
    );
  });

  test('refuses what is closed or a pull request, forced or not', () => {
    assert.deepStrictEqual(
      decideStart(facts({ open: false }), { ...start, force: true }),
      { kind: 'refuse', reason: 'it is closed', overridable: false },
    );

    assert.deepStrictEqual(
      decideStart(facts({ pullRequest: true }), { ...plan, force: true }),
      {
        kind: 'refuse',
        reason: 'it is a pull request, not an issue',
        overridable: false,
      },
    );
  });
});

describe(decideRelease, () => {
  test('releases its own claim, started or planned', () => {
    assert.deepStrictEqual(
      decideRelease(
        facts({ labels: [label('in-progress')], claim: claim({}) }),
        release,
      ),
      { kind: 'release' },
    );

    assert.deepStrictEqual(
      decideRelease(
        facts({
          labels: [label('planned')],
          claim: claim({ state: 'planned' }),
        }),
        release,
      ),
      { kind: 'release' },
    );
  });

  test('releases one no claim names anyone for', () => {
    assert.deepStrictEqual(
      decideRelease(facts({ labels: [label('in-progress')] }), release),
      { kind: 'release' },
    );
  });

  test('refuses what someone else claimed, unless forced', () => {
    const theirs = facts({
      labels: [label('in-progress')],
      claim: claim({ by: OTHER }),
    });

    assert.deepStrictEqual(decideRelease(theirs, release), {
      kind: 'refuse',
      reason: `${OTHER} started it at 2026-10-12T01:00:00Z`,
      overridable: true,
    });

    assert.deepStrictEqual(decideRelease(theirs, { ...release, force: true }), {
      kind: 'release',
    });
  });

  test('refuses a pull request, forced or not', () => {
    assert.deepStrictEqual(
      decideRelease(facts({ pullRequest: true }), {
        ...release,
        force: true,
      }),
      {
        kind: 'refuse',
        reason: 'it is a pull request, not an issue',
        overridable: false,
      },
    );
  });
});

describe(parseStartIssueArgs, () => {
  test('reads the number, with or without #, the claimant and the mode', () => {
    assert.deepStrictEqual(parseStartIssueArgs(['--', '#2701', '--by', ME]), {
      number: 2701,
      by: ME,
      mode: 'start',
      force: false,
    });

    assert.deepStrictEqual(
      parseStartIssueArgs(['--by', ME, '2701', '--force']),
      { number: 2701, by: ME, mode: 'start', force: true },
    );

    assert.deepStrictEqual(
      parseStartIssueArgs(['2701', '--plan', '--by', ME]),
      { number: 2701, by: ME, mode: 'plan', force: false },
    );

    assert.deepStrictEqual(
      parseStartIssueArgs(['--release', '--force', '2701', '--by', ME]),
      { number: 2701, by: ME, mode: 'release', force: true },
    );
  });

  test('says what is wrong with the command line', () => {
    assert.strictEqual(
      parseStartIssueArgs(['--by', ME]),
      'name the issue by its number',
    );

    assert.strictEqual(
      parseStartIssueArgs(['1', '2', '--by', ME]),
      'unexpected argument: 2',
    );

    assert.strictEqual(
      parseStartIssueArgs(['1', '--assign', '--by', ME]),
      'unknown option: --assign',
    );

    assert.strictEqual(
      parseStartIssueArgs(['1', '--plan', '--release', '--by', ME]),
      '--plan and --release do not go together',
    );

    assert.strictEqual(
      parseStartIssueArgs(['1']),
      '--by names who starts it: a session URL, or any other word unique to you',
    );

    assert.strictEqual(
      parseStartIssueArgs(['1', '--by', 'two words']),
      '--by names who starts it: a session URL, or any other word unique to you',
    );
  });
});

const start = { mode: 'start', by: ME, force: false } as const;

const plan = { mode: 'plan', by: ME, force: false } as const;

const release = { by: ME, force: false } as const;

const label = (name: string): Readonly<{ name: string }> => ({ name }) as const;

const claim = (overrides: Partial<IssueClaim>): IssueClaim =>
  ({
    state: 'started',
    by: ME,
    at: '2026-10-12T01:00:00Z',
    ...overrides,
  }) as const;

const facts = (overrides: Partial<IssueFacts>): IssueFacts =>
  ({
    open: true,
    pullRequest: false,
    labels: [],
    closers: [],
    claim: undefined,
    lastClaimant: overrides.claim?.by,
    ...overrides,
  }) as const;
