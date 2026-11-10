import {
  decideStartStates,
  heldIssueClaim,
  issuesInProgress,
  issueStartRank,
  issueStatusOf,
  issueTierLabel,
  issueTierOf,
  parseIssueTier,
  progressOf,
  referenceStatusOf as referenceStatusOfFacts,
  waitsFor,
  withProgress,
  type IssueProgress,
  type ReferenceStatus,
  type StartState,
} from './issues.mjs';

/** v1's call: the facts without the number and title v2's carry. */
const referenceStatusOf = (
  facts: Readonly<
    | { kind: 'issue'; state: string; stateReason: string | undefined }
    | { kind: 'pull-request'; state: string; merged: boolean }
  >,
): ReferenceStatus =>
  facts.kind === 'issue'
    ? issueStatusOf(facts)
    : referenceStatusOfFacts({ ...facts, number: 1, title: '' });

/** v1's call: labels and whether an open pull request closes it. */
const progress = (
  labels: readonly string[],
  closedByOpenPull: boolean,
): IssueProgress => progressOf({ labels, closedByOpenPull, held: undefined });

describe(referenceStatusOfFacts, () => {
  test('anything open is waited for, in either API’s spelling', () => {
    assert.strictEqual(
      referenceStatusOf({
        kind: 'issue',
        state: 'OPEN',
        stateReason: undefined,
      }),
      'waiting',
    );

    assert.strictEqual(
      referenceStatusOf({ kind: 'pull-request', state: 'open', merged: false }),
      'waiting',
    );
  });

  test('a merged pull request is done, and one closed unmerged is abandoned', () => {
    assert.strictEqual(
      referenceStatusOf({
        kind: 'pull-request',
        state: 'MERGED',
        merged: true,
      }),
      'done',
    );

    assert.strictEqual(
      referenceStatusOf({
        kind: 'pull-request',
        state: 'CLOSED',
        merged: false,
      }),
      'abandoned',
    );
  });

  test('an issue is done when closed as completed, or with no reason recorded', () => {
    assert.strictEqual(
      referenceStatusOf({
        kind: 'issue',
        state: 'CLOSED',
        stateReason: 'COMPLETED',
      }),
      'done',
    );

    assert.strictEqual(
      referenceStatusOf({
        kind: 'issue',
        state: 'closed',
        stateReason: undefined,
      }),
      'done',
    );
  });

  test('an issue closed as not planned or as a duplicate is abandoned', () => {
    assert.strictEqual(
      referenceStatusOf({
        kind: 'issue',
        state: 'CLOSED',
        stateReason: 'NOT_PLANNED',
      }),
      'abandoned',
    );

    assert.strictEqual(
      referenceStatusOf({
        kind: 'issue',
        state: 'closed',
        stateReason: 'duplicate',
      }),
      'abandoned',
    );
  });
});

describe(decideStartStates, () => {
  test('an issue that declares nothing is free', () => {
    assert.deepStrictEqual(
      decideStartStates([{ number: 1, startAfter: [] }], known([])),
      new Map<number, StartState>([[1, 'free']]),
    );
  });

  test('an issue that names an open issue in the list is blocked by it', () => {
    assert.deepStrictEqual(
      decideStartStates(
        [
          { number: 1, startAfter: [] },
          { number: 2, startAfter: [1] },
        ],
        known([]),
      ),
      new Map<number, StartState>([
        [1, 'free'],
        [2, 'blocked'],
      ]),
    );
  });

  test('an issue whose every named item is done is ready', () => {
    assert.deepStrictEqual(
      decideStartStates(
        [{ number: 3, startAfter: [1, 2] }],
        known([
          [1, 'done'],
          [2, 'done'],
        ]),
      ),
      new Map<number, StartState>([[3, 'ready']]),
    );
  });

  test('waiting outranks an abandoned or unknown item, which outranks done', () => {
    assert.deepStrictEqual(
      decideStartStates(
        [
          { number: 10, startAfter: [1, 2, 3] },
          { number: 11, startAfter: [1, 2] },
          { number: 12, startAfter: [1, 4] },
        ],
        known([
          [1, 'done'],
          [2, 'abandoned'],
          [3, 'waiting'],
        ]),
      ),
      new Map<number, StartState>([
        [10, 'blocked'],
        [11, 'attention'],
        [12, 'attention'],
      ]),
    );
  });

  test('is not transitive: only what an issue names itself counts', () => {
    assert.deepStrictEqual(
      decideStartStates(
        [
          { number: 1, startAfter: [9] },
          { number: 2, startAfter: [1] },
          { number: 3, startAfter: [8] },
        ],
        known([
          [8, 'done'],
          [9, 'waiting'],
        ]),
      ),
      new Map<number, StartState>([
        [1, 'blocked'],
        [2, 'blocked'],
        [3, 'ready'],
      ]),
    );
  });

  test('issues on a cycle are a cycle, and what waits on one is blocked', () => {
    assert.deepStrictEqual(
      decideStartStates(
        [
          { number: 1, startAfter: [2] },
          { number: 2, startAfter: [1] },
          { number: 3, startAfter: [3] },
          { number: 4, startAfter: [1] },
        ],
        known([]),
      ),
      new Map<number, StartState>([
        [1, 'cycle'],
        [2, 'cycle'],
        [3, 'cycle'],
        [4, 'blocked'],
      ]),
    );
  });
});

describe(waitsFor, () => {
  test('is the Start-After: line and GitHub’s blocked-by, each number once', () => {
    assert.deepStrictEqual(
      waitsFor('Start-After: #3, #1\n', [1, 7]),
      [3, 1, 7],
    );
  });

  test('either alone is enough', () => {
    assert.deepStrictEqual(waitsFor('', [7]), [7]);

    assert.deepStrictEqual(waitsFor('Start-After: #3', []), [3]);
  });
});

describe(withProgress, () => {
  test('a startable issue someone has got to says how far', () => {
    assert.strictEqual(withProgress('free', 'in-progress'), 'in-progress');

    assert.strictEqual(withProgress('ready', 'in-progress'), 'in-progress');

    assert.strictEqual(withProgress('free', 'planned'), 'planned');

    assert.strictEqual(withProgress('ready', 'none'), 'ready');
  });

  test('one that is not startable says why, worked on or not', () => {
    assert.strictEqual(withProgress('blocked', 'in-progress'), 'blocked');

    assert.strictEqual(withProgress('cycle', 'in-progress'), 'cycle');

    assert.strictEqual(withProgress('attention', 'planned'), 'attention');
  });
});

describe(progressOf, () => {
  test('an open pull request closing it is in progress', () => {
    assert.strictEqual(progress([], true), 'in-progress');
  });

  test('so is the in-progress label, with no pull request yet', () => {
    assert.strictEqual(progress(['bug', 'in-progress'], false), 'in-progress');
  });

  test('the planned label is planned', () => {
    assert.strictEqual(progress(['planned'], false), 'planned');
  });

  test('being worked on wins over being planned', () => {
    assert.strictEqual(progress(['planned'], true), 'in-progress');

    assert.strictEqual(
      progress(['planned', 'in-progress'], false),
      'in-progress',
    );
  });

  test('neither, or a label only like them, is none', () => {
    assert.strictEqual(progress([], false), 'none');

    assert.strictEqual(
      progress(['in-progress-x', 'planned-later'], false),
      'none',
    );
  });

  test('reads a label whatever its case, as GitHub does', () => {
    assert.strictEqual(progress(['In-Progress'], false), 'in-progress');

    assert.strictEqual(progress(['Planned'], false), 'planned');
  });
});

describe(issuesInProgress, () => {
  test('is every issue an open pull request closes', () => {
    assert.deepStrictEqual(
      issuesInProgress([{ closes: [1, 2] }, { closes: [2] }, { closes: [] }]),
      new Set<number>([1, 2]),
    );
  });
});

/** `statusOf` for {@link decideStartStates}: what is not listed is unknown. */
const known = (
  statuses: readonly (readonly [number, ReferenceStatus])[],
): ((number: number) => ReferenceStatus) => {
  const byNumber = new Map(statuses);

  return (number) => byNumber.get(number) ?? 'unknown';
};

const held = (state: 'planned' | 'started') =>
  ({ state, by: 'session', at: '2026-10-12T01:00:00Z' }) as const;

describe('progressOf with a claim', () => {
  test('a started claim is in progress, without the label', () => {
    assert.strictEqual(
      progressOf({
        labels: [],
        closedByOpenPull: false,
        held: held('started'),
      }),
      'in-progress',
    );
  });

  test('a planned claim is planned, without the label', () => {
    assert.strictEqual(
      progressOf({
        labels: [],
        closedByOpenPull: false,
        held: held('planned'),
      }),
      'planned',
    );
  });
});

describe(heldIssueClaim, () => {
  const at = '2026-10-12T01:00:00Z';

  /** `at`. */
  const AT = 1_791_766_800_000;

  const claim = (state: 'planned' | 'started') =>
    ({ kind: 'standing', claim: { state, by: 'session', at } }) as const;

  test('a started claim holds until released', () => {
    assert.deepStrictEqual(
      heldIssueClaim(claim('started'), AT + 30 * 24 * 60 * 60_000),
      { state: 'started', by: 'session', at },
    );
  });

  test('a planned claim holds for a day, and lapses after', () => {
    assert.isDefined(heldIssueClaim(claim('planned'), AT));

    assert.isUndefined(heldIssueClaim(claim('planned'), AT + 25 * 60 * 60_000));
  });

  test('a released claim, or none, is nothing', () => {
    assert.isUndefined(heldIssueClaim({ kind: 'released' }, AT));

    assert.isUndefined(heldIssueClaim(undefined, AT));
  });
});

describe(issueTierOf, () => {
  test('reads the one priority label an issue carries', () => {
    assert.strictEqual(issueTierOf(['bug', 'priority:S', 'pending']), 'S');

    assert.strictEqual(issueTierOf(['priority:hold']), 'hold');
  });

  test('says none for no priority label, and the pull request ones are not one', () => {
    assert.strictEqual(issueTierOf([]), 'none');

    assert.strictEqual(issueTierOf(['priority:high', 'priority:low']), 'none');
  });

  test('says several for more than one, which says nothing', () => {
    assert.strictEqual(issueTierOf(['priority:A', 'priority:C']), 'several');
  });
});

describe(issueStartRank, () => {
  test('ranks S first, then A, B and C, then what has no tier, then D', () => {
    const ranks = [
      ['priority:D'],
      ['priority:S'],
      [],
      ['priority:C'],
      ['priority:A', 'priority:B'],
      ['priority:B'],
      ['priority:A'],
    ].map(issueStartRank);

    assert.deepStrictEqual(ranks, [5, 0, 4, 3, 4, 2, 1]);
  });
});

describe(parseIssueTier, () => {
  test('takes a tier as written', () => {
    assert.strictEqual(parseIssueTier('B'), 'B');

    assert.strictEqual(parseIssueTier('hold'), 'hold');
  });

  test('refuses anything else, the pull request priorities included', () => {
    assert.isUndefined(parseIssueTier('b'));

    assert.isUndefined(parseIssueTier('high'));

    assert.isUndefined(parseIssueTier('priority:S'));
  });
});

describe(issueTierLabel, () => {
  test('is the tier under priority:', () => {
    assert.strictEqual(issueTierLabel('close'), 'priority:close');
  });
});
