import { Result } from 'ts-data-forge';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import {
  readRepositoryFacts,
  readRequirements,
  requirementsOfRules,
} from './rest-repository.mjs';
import type { ReadContext } from './transport.mjs';

const contextOf = (
  routes: Parameters<typeof recordedTransport>[0],
): ReadContext =>
  ({
    transport: recordedTransport(routes).transport,
    owner: 'o',
    name: 'n',
    token: 'token',
  }) as const;

describe(requirementsOfRules, () => {
  test('unites every rule, and ignores what it does not know', () => {
    assert.deepStrictEqual(
      requirementsOfRules([
        {
          type: 'required_status_checks',
          parameters: {
            required_status_checks: [{ context: 'a' }, { context: 'b' }],
          },
        },
        {
          type: 'required_status_checks',
          parameters: { required_status_checks: [{ context: 'a' }] },
        },
        {
          type: 'pull_request',
          parameters: {
            require_code_owner_review: true,
            required_review_thread_resolution: false,
          },
        },
        { type: 'required_status_checks', parameters: { unexpected: 1 } },
        { type: 'deletion' },
        'not a rule',
      ]),
      {
        requiredContexts: ['a', 'b'],
        requireCodeOwnerReview: true,
        requireConversationResolution: false,
      },
    );
  });
});

describe(readRequirements, () => {
  const rules = {
    '/repos/o/n/rules/branches/main?per_page=100': ok(
      [
        {
          type: 'required_status_checks',
          parameters: { required_status_checks: [{ context: 'a' }] },
        },
      ],
      {
        link: '<https://api.github.com/repos/o/n/rules/branches/main?per_page=100&page=2>; rel="next"',
      },
    ),
    '/repos/o/n/rules/branches/main?per_page=100&page=2': ok([
      {
        type: 'required_status_checks',
        parameters: { required_status_checks: [{ context: 'b' }] },
      },
    ]),
  } as const;

  test('reads every page of rules, and a classic rule unless it is off', async () => {
    assert.deepStrictEqual(
      Result.unwrapThrow(
        await readRequirements(
          contextOf({
            ...rules,
            '/repos/o/n/branches/main': ok({
              protection: {
                enabled: true,
                required_status_checks: { contexts: ['c'] },
              },
            }),
          }),
          'main',
        ),
      ).requiredContexts,
      ['a', 'b', 'c'],
    );

    assert.deepStrictEqual(
      Result.unwrapThrow(
        await readRequirements(
          contextOf({
            ...rules,
            '/repos/o/n/branches/main': ok({
              protection: {
                required_status_checks: {
                  enforcement_level: 'off',
                  contexts: ['c'],
                },
              },
            }),
          }),
          'main',
        ),
      ).requiredContexts,
      ['a', 'b'],
    );
  });

  test('fails when either read does', async () => {
    assert.isTrue(
      Result.isErr(
        await readRequirements(
          contextOf({
            ...rules,
            '/repos/o/n/branches/main': status(502, 'bad gateway'),
          }),
          'main',
        ),
      ),
    );
  });
});

describe(readRepositoryFacts, () => {
  const base = {
    '/repos/o/n': ok({ full_name: 'o/n', default_branch: 'main' }),
    '/repos/o/n/git/ref/heads/main': ok({ object: { sha: 'f'.repeat(40) } }),
    '/user': ok({ login: 'someone' }),
    '/repos/o/n/labels/merge-queued': ok({ name: 'merge-queued' }),
  } as const;

  test('reads CODEOWNERS, and a missing one or label as none', async () => {
    const facts = Result.unwrapThrow(
      await readRepositoryFacts(
        contextOf({
          ...base,
          '/repos/o/n/contents/.github/CODEOWNERS?ref=main': ok({
            // GitHub wraps the Base64 in lines.
            content: `${OWNERS_BASE64.slice(0, 4)}\n${OWNERS_BASE64.slice(4)}`,
            encoding: 'base64',
          }),
        }),
      ),
    );

    assert.deepStrictEqual(facts, {
      repo: { owner: 'o', name: 'n' },
      defaultBranch: 'main',
      defaultBranchTip: 'f'.repeat(40),
      viewer: Result.ok('someone'),
      codeOwners: Result.ok('* @owner\n'),
      hasQueueLabel: Result.ok(true),
    });

    const missing = Result.unwrapThrow(
      await readRepositoryFacts(
        contextOf({
          ...base,
          '/repos/o/n/contents/.github/CODEOWNERS?ref=main': status(
            404,
            'Not Found',
          ),
          '/repos/o/n/labels/merge-queued': status(404, 'Not Found'),
        }),
      ),
    );

    assert.deepStrictEqual(missing.codeOwners, Result.ok(undefined));

    assert.deepStrictEqual(missing.hasQueueLabel, Result.ok(false));
  });

  // Read as none, a failed fetch would let a pull request waiting for an owner
  // be armed.
  test('keeps a failed CODEOWNERS read apart from none', async () => {
    const facts = Result.unwrapThrow(
      await readRepositoryFacts(
        contextOf({
          ...base,
          '/repos/o/n/contents/.github/CODEOWNERS?ref=main': status(
            502,
            'bad gateway',
          ),
        }),
      ),
    );

    assert.isTrue(Result.isErr(facts.codeOwners));
  });

  test('has no snapshot without the tip, and no viewer without a token', async () => {
    assert.isTrue(
      Result.isErr(
        await readRepositoryFacts(
          contextOf({
            ...base,
            '/repos/o/n/git/ref/heads/main': status(502, 'bad gateway'),
          }),
        ),
      ),
    );

    const anonymous = Result.unwrapThrow(
      await readRepositoryFacts({
        ...contextOf({
          ...base,
          '/repos/o/n/contents/.github/CODEOWNERS?ref=main': status(
            404,
            'Not Found',
          ),
        }),
        token: undefined,
      }),
    );

    assert.strictEqual(
      Result.isErr(anonymous.viewer) ? anonymous.viewer.value.kind : undefined,
      'skipped',
    );
  });

  test('names the repository as GitHub does now, and reads it so', async () => {
    const facts = Result.unwrapThrow(
      await readRepositoryFacts(
        contextOf({
          // Renamed: the old name answers by a redirect.
          '/repos/o/n': ok({ full_name: 'o/m', default_branch: 'main' }),
          '/repos/o/m/git/ref/heads/main': ok({
            object: { sha: 'f'.repeat(40) },
          }),
          '/user': ok({ login: 'someone' }),
          '/repos/o/m/labels/merge-queued': ok({ name: 'merge-queued' }),
          '/repos/o/m/contents/.github/CODEOWNERS?ref=main': status(
            404,
            'Not Found',
          ),
        }),
      ),
    );

    assert.deepStrictEqual(facts.repo, { owner: 'o', name: 'm' });

    assert.deepStrictEqual(facts.hasQueueLabel, Result.ok(true));
  });
});

const OWNERS_BASE64 = Buffer.from('* @owner\n').toString('base64');
