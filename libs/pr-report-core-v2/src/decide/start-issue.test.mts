import type { IssueClaim } from '../conventions/index.mjs';
import {
  decideReleaseIssue,
  decideStartIssue,
  readBackVerdict,
  type StartIssueFacts,
} from './start-issue.mjs';

const ME = 'https://claude.ai/code/session_01me';

const OTHER = 'https://claude.ai/code/session_01other';

describe(decideStartIssue, () => {
  test('starts an open issue nobody has started', () => {
    assert.deepStrictEqual(decideStartIssue(facts({}), start), starting);
  });

  test('takes planned off as it starts one', () => {
    assert.deepStrictEqual(
      decideStartIssue(facts({ labels: ['bug', 'Planned'] }), start),
      startingUnplanned,
    );
  });

  test('refuses one someone else claimed, naming them, unless forced', () => {
    assert.deepStrictEqual(
      decideStartIssue(
        facts({
          labels: ['in-progress'],
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
      decideStartIssue(
        facts({
          labels: ['planned'],
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
      decideStartIssue(
        facts({
          labels: ['in-progress'],
          claim: claim({ by: OTHER }),
        }),
        { ...start, force: true },
      ),
      starting,
    );
  });

  test('lets the claimant claim it again, or start what it planned', () => {
    assert.deepStrictEqual(
      decideStartIssue(
        facts({ labels: ['in-progress'], claim: claim({}) }),
        start,
      ),
      starting,
    );

    assert.deepStrictEqual(
      decideStartIssue(
        facts({
          labels: ['planned'],
          claim: claim({ state: 'planned' }),
        }),
        start,
      ),
      startingUnplanned,
    );

    assert.deepStrictEqual(
      decideStartIssue(
        facts({
          labels: ['planned'],
          claim: claim({ state: 'planned' }),
        }),
        plan,
      ),
      planning,
    );
  });

  test('refuses one labelled in-progress by nobody it can name, unless forced', () => {
    assert.deepStrictEqual(
      decideStartIssue(facts({ labels: ['in-progress'] }), start),
      {
        kind: 'refuse',
        reason: 'it is already labelled in-progress',
        overridable: true,
      },
    );

    assert.deepStrictEqual(
      decideStartIssue(facts({ labels: ['in-progress'] }), {
        ...start,
        force: true,
      }),
      starting,
    );
  });

  test('plans one a person labelled planned only when forced', () => {
    assert.deepStrictEqual(
      decideStartIssue(facts({ labels: ['planned'] }), plan),
      {
        kind: 'refuse',
        reason: 'it is already labelled planned',
        overridable: true,
      },
    );

    assert.deepStrictEqual(
      decideStartIssue(facts({ labels: ['planned'] }), {
        ...plan,
        force: true,
      }),
      planning,
    );
  });

  test('lets the claimant plan again once its plan has lapsed', () => {
    assert.deepStrictEqual(
      decideStartIssue(facts({ labels: ['planned'], lastClaimant: ME }), plan),
      planning,
    );

    assert.deepStrictEqual(
      decideStartIssue(
        facts({ labels: ['planned'], lastClaimant: OTHER }),
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
      decideStartIssue(facts({ labels: ['in-progress'], claim: claim({}) }), {
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
    assert.deepStrictEqual(
      decideStartIssue(facts({ closers: [12, 15] }), start),
      {
        kind: 'refuse',
        reason: 'open pull request #12, #15 closes it',
        overridable: true,
      },
    );

    assert.deepStrictEqual(
      decideStartIssue(facts({ closers: [12] }), { ...start, force: true }),
      starting,
    );
  });

  test('refuses what is closed or a pull request, forced or not', () => {
    assert.deepStrictEqual(
      decideStartIssue(facts({ open: false }), { ...start, force: true }),
      { kind: 'refuse', reason: 'it is closed', overridable: false },
    );

    assert.deepStrictEqual(
      decideStartIssue(facts({ pullRequest: true }), { ...plan, force: true }),
      {
        kind: 'refuse',
        reason: 'it is a pull request, not an issue',
        overridable: false,
      },
    );
  });
});

describe(decideReleaseIssue, () => {
  test('releases its own claim, started or planned', () => {
    assert.deepStrictEqual(
      decideReleaseIssue(
        facts({ labels: ['in-progress'], claim: claim({}) }),
        release,
      ),
      { kind: 'release', releaseClaimOf: ME, removeLabels: ['in-progress'] },
    );

    assert.deepStrictEqual(
      decideReleaseIssue(
        facts({
          labels: ['planned'],
          claim: claim({ state: 'planned' }),
        }),
        release,
      ),
      { kind: 'release', releaseClaimOf: ME, removeLabels: ['planned'] },
    );
  });

  test('releases one no claim names anyone for', () => {
    assert.deepStrictEqual(
      decideReleaseIssue(facts({ labels: ['in-progress'] }), release),
      {
        kind: 'release',
        releaseClaimOf: undefined,
        removeLabels: ['in-progress'],
      },
    );
  });

  test('refuses what someone else claimed, unless forced', () => {
    const theirs = facts({
      labels: ['in-progress'],
      claim: claim({ by: OTHER }),
    });

    assert.deepStrictEqual(decideReleaseIssue(theirs, release), {
      kind: 'refuse',
      reason: `${OTHER} started it at 2026-10-12T01:00:00Z`,
      overridable: true,
    });

    assert.deepStrictEqual(
      decideReleaseIssue(theirs, { ...release, force: true }),
      {
        kind: 'release',
        releaseClaimOf: OTHER,
        removeLabels: ['in-progress'],
      },
    );
  });

  test('refuses a pull request, forced or not', () => {
    assert.deepStrictEqual(
      decideReleaseIssue(facts({ pullRequest: true }), {
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

describe(readBackVerdict, () => {
  test('held when the claim read back is its own, lost when another’s', () => {
    const wrote = { by: ME, state: 'started' } as const;

    assert.deepStrictEqual(readBackVerdict(claim({}), wrote), {
      kind: 'held',
      held: claim({}),
    });

    assert.deepStrictEqual(readBackVerdict(claim({ by: OTHER }), wrote), {
      kind: 'lost',
      held: claim({ by: OTHER }),
    });

    assert.deepStrictEqual(readBackVerdict(undefined, wrote), {
      kind: 'none',
    });
  });

  test('lost to its claimant’s own other run, in another state', () => {
    assert.strictEqual(
      readBackVerdict(claim({ state: 'planned' }), {
        by: ME,
        state: 'started',
      }).kind,
      'lost',
    );
  });
});

const start = { mode: 'start', by: ME, force: false } as const;

const plan = { mode: 'plan', by: ME, force: false } as const;

const release = { by: ME, force: false } as const;

const claim = (overrides: Partial<IssueClaim>): IssueClaim =>
  ({
    state: 'started',
    by: ME,
    at: '2026-10-12T01:00:00Z',
    ...overrides,
  }) as const;

const facts = (overrides: Partial<StartIssueFacts>): StartIssueFacts =>
  ({
    open: true,
    pullRequest: false,
    labels: [],
    closers: [],
    claim: undefined,
    lastClaimant: overrides.claim?.by,
    ...overrides,
  }) as const;

const starting = {
  kind: 'claim',
  state: 'started',
  label: 'in-progress',
  removePlanned: false,
} as const;

const startingUnplanned = { ...starting, removePlanned: true } as const;

const planning = {
  kind: 'claim',
  state: 'planned',
  label: 'planned',
  removePlanned: false,
} as const;
