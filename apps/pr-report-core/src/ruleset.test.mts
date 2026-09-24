import { Result } from 'ts-data-forge';
import { parseRuleset } from './ruleset.mjs';

describe(parseRuleset, () => {
  test('reads the required contexts and the code-owner rule', () => {
    const parsed = parseRuleset(
      JSON.stringify({
        rules: [
          { type: 'deletion' },
          {
            type: 'pull_request',
            parameters: {
              required_approving_review_count: 0,
              require_code_owner_review: true,
            },
          },
          {
            type: 'required_status_checks',
            parameters: {
              strict_required_status_checks_policy: true,
              required_status_checks: [
                { context: 'code-check-result', integration_id: 15_368 },
                { context: 'no-skip-ci-label' },
              ],
            },
          },
        ],
      }),
      'main.json',
    );

    assert.isTrue(Result.isOk(parsed));

    assert.deepStrictEqual(parsed.value, {
      requiredContexts: ['code-check-result', 'no-skip-ci-label'],
      requireCodeOwnerReview: true,
    });
  });

  test('requires nothing of a ruleset that says nothing', () => {
    const parsed = parseRuleset(
      JSON.stringify({ rules: [{ type: 'deletion' }] }),
      'main.json',
    );

    assert.isTrue(Result.isOk(parsed));

    assert.deepStrictEqual(parsed.value, {
      requiredContexts: [],
      requireCodeOwnerReview: false,
    });
  });

  test('names the file when it is not JSON', () => {
    const parsed = parseRuleset('{', 'main.json');

    assert.isTrue(Result.isErr(parsed));

    assert.isTrue(parsed.value.startsWith('main.json is not valid JSON'));
  });

  test('names the file when it is not a ruleset', () => {
    const parsed = parseRuleset('{"name":"main"}', 'main.json');

    assert.isTrue(Result.isErr(parsed));

    assert.isTrue(parsed.value.startsWith('main.json has an unexpected shape'));
  });
});
