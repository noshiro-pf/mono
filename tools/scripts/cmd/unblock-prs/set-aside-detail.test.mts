import {
  describeConflict,
  describeFailedChecks,
  describeHold,
  describeTimeout,
} from './set-aside-detail.mjs';
import { type ChecksSummary } from './types.mjs';

describe(describeFailedChecks, () => {
  test('names the failed checks and links the first', () => {
    assert.deepStrictEqual(
      describeFailedChecks(
        summary({
          failed: [
            {
              name: 'code-check-result / result',
              link: 'https://example.test/1',
            },
            {
              name: 'style-check-result / result',
              link: 'https://example.test/2',
            },
          ],
        }),
      ),
      {
        detail:
          'failed: code-check-result / result, style-check-result / result',
        link: 'https://example.test/1',
      },
    );
  });

  test('leaves the link out when the check has none', () => {
    assert.deepStrictEqual(
      describeFailedChecks(
        summary({ failed: [{ name: 'no-skip-ci-label', link: '' }] }),
      ),
      { detail: 'failed: no-skip-ci-label', link: undefined },
    );
  });
});

describe(describeHold, () => {
  test('says a review is missing', () => {
    assert.strictEqual(
      describeHold('BLOCKED', 'REVIEW_REQUIRED'),
      'green but BLOCKED: a required review is missing (a code owner?)',
    );
  });

  test('says changes were requested', () => {
    assert.strictEqual(
      describeHold('BLOCKED', 'CHANGES_REQUESTED'),
      'green but BLOCKED: changes requested',
    );
  });

  // #2069 was set aside as "green but not merged", which named nothing.
  test('names what is left when no review is missing', () => {
    for (const reviewDecision of ['APPROVED', '', undefined]) {
      assert.strictEqual(
        describeHold('CLEAN', reviewDecision),
        'green but CLEAN: an unresolved conversation, or armed by who may not merge?',
      );
    }
  });
});

describe(describeTimeout, () => {
  test('names what it was still waiting on', () => {
    assert.strictEqual(
      describeTimeout(summary({ running: ['code-check (ws:fix:lint)'] }), 90),
      'after 90 min, still waiting on code-check (ws:fix:lint) (running)',
    );
  });
});

describe(describeConflict, () => {
  test('names the conflicting files', () => {
    assert.strictEqual(
      describeConflict(['a.mts', 'b/c.mts'], 'CONFLICT (content): …', 'main'),
      'conflicts with main in a.mts, b/c.mts',
    );
  });

  test("falls back to git's own words when no file is named", () => {
    assert.strictEqual(
      describeConflict([], 'error: could not apply 1234abc\nhint: …', 'main'),
      'rebase onto main failed: error: could not apply 1234abc hint: …',
    );
  });
});

const summary = (overrides: Partial<ChecksSummary> = {}): ChecksSummary =>
  ({
    status: 'pending',
    failed: [],
    pending: [],
    missing: [],
    running: [],
    total: 9,
    ...overrides,
  }) as const;
