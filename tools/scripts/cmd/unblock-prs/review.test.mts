import dedent from 'dedent';
import { parseCodeOwners } from 'pr-report-core';
import { reviewHold, type ReviewRules, type ReviewState } from './review.mjs';

describe(reviewHold, () => {
  test('holds nothing when the review is done', () => {
    assert.isUndefined(reviewHold(state({ approvers: ['owner'] }), rules()));
  });

  test('holds nothing that touches no owned path', () => {
    assert.isUndefined(reviewHold(state({ files: ['docs/a.md'] }), rules()));
  });

  test('holds a pull request an owner has not approved', () => {
    assert.strictEqual(
      reviewHold(state(), rules()),
      'waiting for @owner to approve .github/workflows/ci.yml',
    );
  });

  test('says when the author is the owner, who cannot approve it', () => {
    assert.strictEqual(
      reviewHold(state({ author: 'Owner' }), rules()),
      'waiting for @owner to approve .github/workflows/ci.yml — which the author owns, and may not approve',
    );
  });

  test('names a few of the waiting paths and counts the rest', () => {
    assert.strictEqual(
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
      'waiting for @owner to approve .github/workflows/a.yml, .github/workflows/b.yml and 2 more',
    );
  });

  test('holds a pull request with an unresolved conversation', () => {
    assert.strictEqual(
      reviewHold(
        state({ approvers: ['owner'], unresolvedConversations: 2 }),
        rules(),
      ),
      '2 unresolved review conversations',
    );

    assert.strictEqual(
      reviewHold(
        state({ approvers: ['owner'], unresolvedConversations: 1 }),
        rules(),
      ),
      '1 unresolved review conversation',
    );
  });

  test('says both when both hold it', () => {
    assert.strictEqual(
      reviewHold(state({ unresolvedConversations: 1 }), rules()),
      'waiting for @owner to approve .github/workflows/ci.yml; 1 unresolved review conversation',
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
