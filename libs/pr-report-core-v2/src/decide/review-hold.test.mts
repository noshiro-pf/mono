import dedent from 'dedent';
import { parseCodeOwners } from './code-owners.mjs';
import {
  codeOwnerReviewOf,
  reviewHold,
  reviewStateOf,
  type ReviewHold,
  type ReviewRules,
  type ReviewState,
} from './review-hold.mjs';

describe(reviewHold, () => {
  test('holds nothing when the review is done', () => {
    assert.isUndefined(reviewHold(state({ approvers: ['owner'] }), rules()));
  });

  test('holds nothing that touches no owned path', () => {
    assert.isUndefined(reviewHold(state({ files: ['docs/a.md'] }), rules()));
  });

  test('holds a pull request an owner has not approved', () => {
    assert.deepStrictEqual(
      reviewHold(state(), rules()),
      held('waiting for @owner to approve .github/workflows/ci.yml'),
    );
  });

  // GitHub does not let an author approve their own pull request, so when the
  // author is the only owner nothing will ever approve it: it merges by a
  // ruleset bypass or not at all, and what the bypass wants is a green head.
  test('leaves one only its author owns to a bypass merge', () => {
    assert.deepStrictEqual(
      reviewHold(state({ author: 'Owner' }), rules()),
      bypass(
        '@owner is the only owner of .github/workflows/ci.yml and its author, who may not approve it',
      ),
    );
  });

  test('holds one the author owns beside someone who may approve it', () => {
    assert.deepStrictEqual(
      reviewHold(
        state({ author: 'Owner' }),
        rules({
          codeOwners: parseCodeOwners(dedent`
            /.github/workflows/ @owner @other
          `),
        }),
      ),
      held(
        'waiting for @owner or @other to approve .github/workflows/ci.yml — which the author owns, and may not approve',
      ),
    );
  });

  // A conversation is something a person can resolve, so it holds the pull
  // request as ever; the bypass is for what nobody can clear.
  test('holds one only its author owns while a conversation is open', () => {
    assert.deepStrictEqual(
      reviewHold(
        state({ author: 'owner', unresolvedConversations: 1 }),
        rules(),
      ),
      held(
        'waiting for @owner to approve .github/workflows/ci.yml — which the author owns, and may not approve; 1 unresolved review conversation',
      ),
    );
  });

  test('names a few of the waiting paths and counts the rest', () => {
    assert.deepStrictEqual(
      reviewHold(
        state({
          files: [
            '.github/workflows/a.yml',
            '.github/workflows/b.yml',
            '.github/workflows/c.yml',
            '.github/workflows/d.yml',
          ],
        }),
        rules(),
      ),
      held(
        'waiting for @owner to approve .github/workflows/a.yml, .github/workflows/b.yml and 2 more',
      ),
    );
  });

  test('holds a pull request with an unresolved conversation', () => {
    assert.deepStrictEqual(
      reviewHold(
        state({ approvers: ['owner'], unresolvedConversations: 2 }),
        rules(),
      ),
      held('2 unresolved review conversations'),
    );

    assert.deepStrictEqual(
      reviewHold(
        state({ approvers: ['owner'], unresolvedConversations: 1 }),
        rules(),
      ),
      held('1 unresolved review conversation'),
    );
  });

  test('says both when both hold it', () => {
    assert.deepStrictEqual(
      reviewHold(state({ unresolvedConversations: 1 }), rules()),
      held(
        'waiting for @owner to approve .github/workflows/ci.yml; 1 unresolved review conversation',
      ),
    );
  });

  test('asks only what the rules require', () => {
    assert.isUndefined(
      reviewHold(
        state({ unresolvedConversations: 3 }),
        rules({
          requireCodeOwnerReview: false,
          requireConversationResolution: false,
        }),
      ),
    );
  });

  describe('where a required check enforces CODEOWNERS', () => {
    // The check counts the author as approving what they own, so the owner's
    // own pull request waits for nobody — no bypass merge either.
    test('holds nothing an owner wrote', () => {
      assert.isUndefined(reviewHold(state({ author: 'Owner' }), byCheck()));
    });

    test('holds one someone else wrote until an owner approves it', () => {
      assert.deepStrictEqual(
        reviewHold(state(), byCheck()),
        held('waiting for @owner to approve .github/workflows/ci.yml'),
      );

      assert.isUndefined(
        reviewHold(state({ approvers: ['owner'] }), byCheck()),
      );
    });

    // Under the ruleset's rule the author cannot approve, whatever the check
    // says, so that rule decides (`codeOwnerGate` says which).
    test('follows the gate when it is the ruleset', () => {
      assert.deepStrictEqual(
        reviewHold(
          state({ author: 'owner' }),
          byCheck({ codeOwnerGate: 'ruleset' }),
        ),
        bypass(
          '@owner is the only owner of .github/workflows/ci.yml and its author, who may not approve it',
        ),
      );
    });

    test('still holds an unresolved conversation', () => {
      assert.deepStrictEqual(
        reviewHold(
          state({ author: 'owner', unresolvedConversations: 1 }),
          byCheck(),
        ),
        held('1 unresolved review conversation'),
      );
    });
  });

  // A changed file past what could be read might be owned, but "might" is not a
  // reason to hold the queue: the watch still catches a pull request that goes
  // green and does not merge.
  test('holds nothing it cannot be sure of', () => {
    assert.isUndefined(
      reviewHold(
        state({ files: ['docs/a.md'], filesComplete: false }),
        rules(),
      ),
    );
  });
});

describe('reviewHold with who pushed', () => {
  // Under the check, an owner's own pull request waits for nobody — unless
  // someone else pushed to it, when its only owner is still its author, who may
  // not approve it: a bypass merge, as under the ruleset's rule.
  test('leaves an owner’s pull request another writer pushed to to a bypass', () => {
    assert.strictEqual(
      reviewHold(state({ author: 'owner', pushers: ['owner'] }), byCheck()),
      undefined,
    );

    assert.strictEqual(
      reviewHold(
        state({ author: 'owner', pushers: ['owner', 'helper'] }),
        byCheck(),
      )?.kind,
      'bypass',
    );
  });

  // Who pushed decides between nothing waiting and a bypass, so not knowing is
  // neither: an unknown answer holds nothing, and calls for no bypass merge.
  test('holds nothing when who pushed is unknown and decides it', () => {
    assert.isUndefined(
      reviewHold(state({ author: 'owner', pushers: 'unknown' }), byCheck()),
    );

    assert.deepStrictEqual(
      reviewHold(
        state({
          author: 'owner',
          pushers: 'unknown',
          unresolvedConversations: 1,
        }),
        byCheck(),
      ),
      held('1 unresolved review conversation'),
    );

    assert.strictEqual(
      reviewHold(
        state({ author: 'owner', pushers: 'unknown' }),
        byCheck({ codeOwnerGate: 'ruleset' }),
      )?.kind,
      'bypass',
    );
  });

  test('holds nothing on a path the author shares when who pushed is unknown', () => {
    const shared = byCheck({
      codeOwners: parseCodeOwners(dedent`
        /.github/workflows/ @owner @other
      `),
    });

    assert.isUndefined(
      reviewHold(state({ author: 'owner', pushers: 'unknown' }), shared),
    );

    assert.strictEqual(
      reviewHold(state({ author: 'owner', pushers: ['owner', 'x'] }), shared)
        ?.kind,
      'held',
    );
  });
});

describe(codeOwnerReviewOf, () => {
  // What holds nothing is not always known: `unblock-prs` holds a red check it
  // cannot judge rather than re-running it, and has to tell the two apart.
  test('tells an approval from what holds nothing', () => {
    assert.deepStrictEqual(
      codeOwnerReviewOf(state({ approvers: ['owner'] }), byCheck()),
      { state: 'approved' },
    );

    assert.deepStrictEqual(
      codeOwnerReviewOf(state({ author: 'owner' }), byCheck()),
      { state: 'approved' },
    );

    assert.deepStrictEqual(
      codeOwnerReviewOf(state({ files: ['docs/a.md'] }), byCheck()),
      { state: 'not-required' },
    );

    assert.deepStrictEqual(
      codeOwnerReviewOf(
        state({ files: ['docs/a.md'], filesComplete: false }),
        byCheck(),
      ),
      { state: 'unknown' },
    );
  });

  test('requires nothing where nothing enforces the file', () => {
    assert.deepStrictEqual(
      codeOwnerReviewOf(state(), rules({ requireCodeOwnerReview: false })),
      { state: 'not-required' },
    );
  });
});

const held = (reason: string): ReviewHold =>
  ({ kind: 'held', reason }) as const;

const bypass = (reason: string): ReviewHold =>
  ({ kind: 'bypass', reason }) as const;

const rules = (overrides: Partial<ReviewRules> = {}): ReviewRules =>
  ({
    requireCodeOwnerReview: true,
    requireConversationResolution: true,
    codeOwners: parseCodeOwners(dedent`
      /.github/workflows/ @owner
    `),
    ...overrides,
  }) as const;

const state = (overrides: Partial<ReviewState> = {}): ReviewState =>
  ({
    author: 'someone',
    approvers: [],
    files: ['.github/workflows/ci.yml', 'README.md'],
    filesComplete: true,
    unresolvedConversations: 0,
    ...overrides,
  }) as const;

const byCheck = (overrides: Partial<ReviewRules> = {}): ReviewRules =>
  rules({
    requireCodeOwnerReview: false,
    codeOwnerGate: 'check',
    ...overrides,
  });

describe(reviewStateOf, () => {
  test('approvers are the latest reviews that approve', () => {
    const read = reviewStateOf('author', {
      latestReviews: [
        { login: 'a', state: 'APPROVED' },
        { login: 'b', state: 'CHANGES_REQUESTED' },
        { login: 'c', state: 'DISMISSED' },
      ],
      files: [],
      filesComplete: true,
      unresolvedConversations: 0,
      pushers: 'unknown',
    });

    assert.deepStrictEqual(read.approvers, ['a']);
  });

  test('a rename changes its old path too, and one with no old path is not every path', () => {
    const told = reviewStateOf('author', {
      latestReviews: [],
      files: [
        { path: 'b.md', change: 'renamed', previousPath: 'a.md' },
        { path: 'c.md', change: 'modified', previousPath: undefined },
      ],
      filesComplete: true,
      unresolvedConversations: 0,
      pushers: 'unknown',
    });

    assert.deepStrictEqual(told.files, ['b.md', 'a.md', 'c.md']);

    assert.isTrue(told.filesComplete);

    const untold = reviewStateOf('author', {
      latestReviews: [],
      files: [{ path: 'b.md', change: 'copied', previousPath: undefined }],
      filesComplete: true,
      unresolvedConversations: 0,
      pushers: 'unknown',
    });

    assert.isFalse(untold.filesComplete);
  });
});

describe('reviewHold with conversations a reader cannot count', () => {
  test('holds nothing', () => {
    assert.isUndefined(
      reviewHold(
        state({ approvers: ['owner'], unresolvedConversations: 'unknown' }),
        rules({ requireConversationResolution: true }),
      ),
    );
  });
});
