import { Result } from 'ts-data-forge';
import { loadBranchRules } from './branch-rules.mjs';
import type { ReportSource } from './constants.mjs';
import type { RestFetch, RestFetchInit } from './workflow-runs.mjs';

// The repository the fixtures were taken from.
const SOURCE: ReportSource = { owner: 'noshiro-pf', repo: 'mono' } as const;

describe(loadBranchRules, () => {
  test('adds up the rulesets on the branch and its classic protection', async () => {
    const { fetchImpl, sent } = answering({
      rules: [
        {
          type: 'pull_request',
          parameters: {
            require_code_owner_review: true,
            required_review_thread_resolution: false,
          },
        },
        {
          type: 'required_status_checks',
          parameters: {
            required_status_checks: [
              { context: 'code-check-result / result' },
              { context: 'lint' },
            ],
          },
        },
        { type: 'deletion' },
      ],
      branch: {
        protection: {
          enabled: true,
          required_status_checks: {
            enforcement_level: 'non_admins',
            contexts: ['lint', 'build'],
          },
        },
      },
    });

    const loaded = await loadBranchRules(SOURCE, 'main', {
      token: 'secret',
      fetchImpl,
    });

    assert.isTrue(Result.isOk(loaded));

    assert.deepStrictEqual(loaded.value, {
      requiredContexts: ['code-check-result / result', 'lint', 'build'],
      requireCodeOwnerReview: true,
      requireConversationResolution: false,
    });

    assert.deepStrictEqual(sent.map(({ route }) => route).toSorted(), [
      'https://api.github.com/repos/noshiro-pf/mono/branches/main',
      'https://api.github.com/repos/noshiro-pf/mono/rules/branches/main?per_page=100',
    ]);

    for (const { init } of sent) {
      assert.strictEqual(init.method, 'GET');

      assert.strictEqual(init.headers['Authorization'], 'Bearer secret');

      // The browser revalidates, and a `304` costs nothing.
      assert.strictEqual(init.cache, 'no-cache');
    }
  });

  test('requires nothing of a branch nothing protects', async () => {
    const { fetchImpl } = answering({
      rules: [],
      branch: {
        protection: {
          enabled: false,
          required_status_checks: { enforcement_level: 'off', contexts: [] },
        },
      },
    });

    const loaded = await loadBranchRules(SOURCE, 'main', {
      token: 'secret',
      fetchImpl,
    });

    assert.isTrue(Result.isOk(loaded));

    assert.deepStrictEqual(loaded.value, {
      requiredContexts: [],
      requireCodeOwnerReview: false,
      requireConversationResolution: false,
    });
  });

  test('reads no contexts off classic protection that is switched off', async () => {
    const { fetchImpl } = answering({
      rules: [],
      branch: {
        protection: {
          enabled: false,
          required_status_checks: {
            enforcement_level: 'off',
            contexts: ['stale'],
          },
        },
      },
    });

    const loaded = await loadBranchRules(SOURCE, 'main', {
      token: 'secret',
      fetchImpl,
    });

    assert.isTrue(Result.isOk(loaded));

    assert.deepStrictEqual(loaded.value.requiredContexts, []);
  });

  test('puts the branch name in the path as one segment', async () => {
    const { fetchImpl, sent } = answering({ rules: [], branch: {} });

    await loadBranchRules(SOURCE, 'release/1.x', {
      token: 'secret',
      fetchImpl,
    });

    assert.isTrue(
      sent.some(({ route }) =>
        route.endsWith('/rules/branches/release%2F1.x?per_page=100'),
      ),
    );
  });

  test('fails with a sentence when GitHub refuses', async () => {
    const loaded = await loadBranchRules(SOURCE, 'main', {
      token: 'secret',
      fetchImpl: notFound,
    });

    assert.isTrue(Result.isErr(loaded));

    assert.include(loaded.value, '404');

    assert.include(loaded.value, 'main');
  });

  test('fails on an answer of another shape', async () => {
    const { fetchImpl } = answering({ rules: { rules: [] }, branch: {} });

    const loaded = await loadBranchRules(SOURCE, 'main', {
      token: 'secret',
      fetchImpl,
    });

    assert.isTrue(Result.isErr(loaded));

    assert.include(loaded.value, 'not the shape this page expects');
  });
});

type Sent = Readonly<{ route: string; init: RestFetchInit }>;

/** A `fetch` answering the two routes with the bodies given. */
const answering = (
  bodies: Readonly<{ rules: unknown; branch: unknown }>,
): Readonly<{ fetchImpl: RestFetch; sent: readonly Sent[] }> => {
  const mut_sent: Sent[] = [];

  const fetchImpl: RestFetch = (route, init) => {
    mut_sent.push({ route, init });

    return Promise.resolve(
      Response.json(
        route.includes('/rules/branches/') ? bodies.rules : bodies.branch,
      ),
    );
  };

  return { fetchImpl, sent: mut_sent };
};

const notFound: RestFetch = () =>
  Promise.resolve(new Response('{}', { status: 404, statusText: 'Not Found' }));
