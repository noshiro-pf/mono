import { Result } from 'ts-data-forge';
import { parseRuleset, requirementsOfRules } from './ruleset.mjs';

describe(parseRuleset, () => {
  test('reads the required contexts and the review rules', () => {
    const parsed = parseRuleset(
      JSON.stringify({
        rules: [
          { type: 'deletion' },
          {
            type: 'pull_request',
            parameters: {
              required_approving_review_count: 0,
              require_code_owner_review: true,
              required_review_thread_resolution: true,
            },
          },
          {
            type: 'required_status_checks',
            parameters: {
              strict_required_status_checks_policy: true,
              required_status_checks: [
                {
                  context: 'code-check-result / result',
                  integration_id: 15_368,
                },
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
      requiredContexts: ['code-check-result / result', 'no-skip-ci-label'],
      requireCodeOwnerReview: true,
      requireConversationResolution: true,
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
      requireConversationResolution: false,
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

describe(requirementsOfRules, () => {
  test('reads the rules GitHub applies to a branch, whichever ruleset they come from', () => {
    // The shape of `GET /repos/{owner}/{repo}/rules/branches/{branch}`: the
    // rules of every ruleset that applies, each carrying where it came from.
    assert.deepStrictEqual(
      requirementsOfRules([
        {
          type: 'pull_request',
          ruleset_source_type: 'Repository',
          ruleset_id: 1,
          parameters: {
            require_code_owner_review: false,
            required_review_thread_resolution: true,
          },
        },
        {
          type: 'pull_request',
          ruleset_source_type: 'Organization',
          ruleset_id: 2,
          parameters: {
            require_code_owner_review: true,
            required_review_thread_resolution: false,
          },
        },
        {
          type: 'required_status_checks',
          ruleset_id: 1,
          parameters: {
            required_status_checks: [{ context: 'a' }],
          },
        },
        {
          type: 'required_status_checks',
          ruleset_id: 2,
          parameters: {
            required_status_checks: [{ context: 'a' }, { context: 'b' }],
          },
        },
      ]),
      {
        requiredContexts: ['a', 'b'],
        requireCodeOwnerReview: true,
        requireConversationResolution: true,
      },
    );
  });

  test('passes over a rule whose parameters it does not recognize', () => {
    assert.deepStrictEqual(
      requirementsOfRules([
        { type: 'pull_request', parameters: {} },
        { type: 'required_status_checks' },
        'not a rule',
      ]),
      {
        requiredContexts: [],
        requireCodeOwnerReview: false,
        requireConversationResolution: false,
      },
    );
  });
});
