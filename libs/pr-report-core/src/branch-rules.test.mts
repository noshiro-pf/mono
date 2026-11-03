import { Result } from 'ts-data-forge';
import type * as t from 'ts-fortress';
import {
  readBranchRequirements,
  type BranchRulesGet,
} from './branch-rules.mjs';

describe(readBranchRequirements, () => {
  test('adds up the rulesets on the branch and its classic protection', async () => {
    const { get, asked } = answering({
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

    const read = await readBranchRequirements('main', get);

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value, {
      requiredContexts: ['code-check-result / result', 'lint', 'build'],
      requireCodeOwnerReview: true,
      requireConversationResolution: false,
    });

    assert.deepStrictEqual(asked.toSorted(), [
      '/branches/main',
      '/rules/branches/main?per_page=100',
    ]);
  });

  test('reads the contexts of a classic rule where no ruleset applies', async () => {
    const { get } = answering({
      rules: [],
      branch: {
        protection: {
          enabled: true,
          required_status_checks: {
            enforcement_level: 'everyone',
            contexts: ['build'],
          },
        },
      },
    });

    const read = await readBranchRequirements('main', get);

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value.requiredContexts, ['build']);
  });

  test('requires nothing of a branch nothing protects', async () => {
    const { get } = answering({ rules: [], branch: { protection: {} } });

    const read = await readBranchRequirements('main', get);

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value, {
      requiredContexts: [],
      requireCodeOwnerReview: false,
      requireConversationResolution: false,
    });
  });

  test('reads no contexts off classic protection that is switched off', async () => {
    const { get } = answering({
      rules: [],
      branch: {
        protection: {
          enabled: true,
          required_status_checks: {
            enforcement_level: 'off',
            contexts: ['stale'],
          },
        },
      },
    });

    const read = await readBranchRequirements('main', get);

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value.requiredContexts, []);
  });

  test('reads no contexts off classic protection that is disabled', async () => {
    const { get } = answering({
      rules: [],
      branch: {
        protection: {
          enabled: false,
          required_status_checks: { contexts: ['stale'] },
        },
      },
    });

    const read = await readBranchRequirements('main', get);

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value.requiredContexts, []);
  });

  test('puts the branch name in the path as one segment', async () => {
    const { get, asked } = answering({ rules: [], branch: {} });

    await readBranchRequirements('release/1.x', get);

    assert.deepStrictEqual(asked.toSorted(), [
      '/branches/release%2F1.x',
      '/rules/branches/release%2F1.x?per_page=100',
    ]);
  });

  test.each(['/rules/', '/branches/main'] as const)(
    'fails when %s fails',
    async (failing) => {
      const get: BranchRulesGet = (path, schema, what) =>
        Promise.resolve(
          path.startsWith(failing)
            ? Result.err(`refused ${what}`)
            : validated(schema, path.startsWith('/rules/') ? [] : {}),
        );

      const read = await readBranchRequirements('main', get);

      assert.isTrue(Result.isErr(read));

      assert.include(read.value, 'main');
    },
  );

  test('fails on rules of another shape', async () => {
    const { get } = answering({ rules: { rules: [] }, branch: {} });

    const read = await readBranchRequirements('main', get);

    assert.isTrue(Result.isErr(read));
  });

  test('fails on protection of another shape', async () => {
    const { get } = answering({
      rules: [],
      branch: { protection: { required_status_checks: { contexts: 'build' } } },
    });

    const read = await readBranchRequirements('main', get);

    assert.isTrue(Result.isErr(read));
  });

  test('takes a classic rule that names no level as enforcing', async () => {
    const { get } = answering({
      rules: [],
      branch: {
        protection: { required_status_checks: { contexts: ['build'] } },
      },
    });

    const read = await readBranchRequirements('main', get);

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value.requiredContexts, ['build']);
  });
});

const validated = <A,>(schema: t.Type<A>, body: unknown): Result<A, string> => {
  const checked = schema.validate(body);

  return Result.isErr(checked)
    ? Result.err('not the shape expected')
    : Result.ok(checked.value);
};

/** A `get` answering the two paths with the bodies given. */
const answering = (
  bodies: Readonly<{ rules: unknown; branch: unknown }>,
): Readonly<{ get: BranchRulesGet; asked: readonly string[] }> => {
  const mut_asked: string[] = [];

  const get: BranchRulesGet = (path, schema) => {
    mut_asked.push(path);

    return Promise.resolve(
      validated(
        schema,
        path.startsWith('/rules/') ? bodies.rules : bodies.branch,
      ),
    );
  };

  return { get, asked: mut_asked };
};
