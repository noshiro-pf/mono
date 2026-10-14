import dedent from 'dedent';
import { parseCodeOwners } from 'pr-report-core';
import {
  reviewHold,
  type ReviewHold,
  type ReviewRules,
  type ReviewState,
} from './review.mjs';

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

  // A changed file past what could be read might be owned, but "might" is not
  // a reason to hold the queue: the watch still catches a pull request that
  // goes green and does not merge.
  test('holds nothing it cannot be sure of', () => {
    assert.isUndefined(
      reviewHold(
        state({ files: ['docs/a.md'], filesComplete: false }),
        rules(),
      ),
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
