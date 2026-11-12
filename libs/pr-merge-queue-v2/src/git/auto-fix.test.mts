import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { HeadChecks } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import {
  gitOk,
  makeRepository,
  type GitRepository,
} from '../../test/index.mjs';
import type { AutoFixConfig } from '../config/index.mjs';
import {
  autoFixInWorktree,
  planAutoFix,
  type AutoFixPlan,
} from './auto-fix.mjs';

const NOW = Date.parse('2026-11-10T00:00:00Z');

const CONFIG: AutoFixConfig = {
  ignore: [/-result \/ result$/u],
  before: ['true before'],
  prepare: [{ context: /^lint/u, run: 'true prepare' }],
  fixers: [
    { context: /^lint \/ (\S+)$/u, run: 'pnpm run fix:$1', stage: 1 },
    { context: /^gen \/ (\S+)$/u, run: 'pnpm run gen:$1', stage: 0 },
  ],
  after: ['true after'],
  notFixableAnnotation: 'command failed',
} as const;

/** The check runs of one head, each failed, with the annotations given. */
const failedRuns = (
  names: readonly string[],
  titles: readonly string[] = [],
): HeadChecks =>
  ({
    sha: 'a'.repeat(40),
    runs: names.map((name, index) => ({
      name,
      status: 'completed',
      conclusion: 'failure',
      checkSuiteId: 1,
      id: index + 1,
      startedAt: undefined,
      completedAt: undefined,
      annotationTitles: Result.ok(titles),
      url: '',
    })),
    statuses: [],
    rounds: [],
  }) as const;

describe(planAutoFix, () => {
  test('runs the fixers of every failed job, by stage, with the steps around them', () => {
    assert.deepStrictEqual(
      planAutoFix(
        failedRuns(['lint / fmt', 'gen / index', 'code-check-result / result']),
        CONFIG,
        NOW,
      ),
      Result.ok({
        before: ['true before'],
        prepare: ['true prepare'],
        commands: [
          String.raw`pnpm run gen:'index'`,
          String.raw`pnpm run fix:'fmt'`,
        ],
        after: ['true after'],
      }),
    );
  });

  test('declines when a failed job matches no fixer', () => {
    assert.deepStrictEqual(
      planAutoFix(failedRuns(['lint / fmt', 'test / unit']), CONFIG, NOW),
      Result.err("test / unit failed, which is not a fixer's diff"),
    );
  });

  test('declines a job whose run says its command failed', () => {
    const planned = planAutoFix(
      failedRuns(['lint / fmt'], ['command failed']),
      CONFIG,
      NOW,
    );

    assert.isTrue(Result.isErr(planned));
  });

  test('declines without a configuration, or with nothing failed', () => {
    assert.isTrue(
      Result.isErr(planAutoFix(failedRuns(['lint / fmt']), undefined, NOW)),
    );

    assert.isTrue(
      Result.isErr(
        planAutoFix(failedRuns(['code-check-result / result']), CONFIG, NOW),
      ),
    );
  });
});

const PLAN: AutoFixPlan = {
  before: [],
  prepare: [],
  commands: ['printf fixed > fixed.txt'],
  after: [],
} as const;

const WORLD = {
  log: (): void => {},
  stopRequested: (): boolean => false,
} as const;

/** A branch `pr` one commit on `main`, pushed. */
const onePr = async (repository: GitRepository): Promise<string> => {
  const head = await repository.commit('pr.txt', 'pr\n', 'pr');

  await repository.push(head, 'pr');

  return head;
};

const fix = async (
  repository: GitRepository,
  head: string,
  plan: AutoFixPlan = PLAN,
): ReturnType<typeof autoFixInWorktree> =>
  autoFixInWorktree(
    repository.place,
    { number: 1, branch: 'pr', head, base: 'main' },
    plan,
    WORLD,
  );

describe(autoFixInWorktree, () => {
  test('amends what the fixer wrote onto the one commit and pushes it', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const head = await onePr(repository);

    const fixed = await fix(repository, head);

    const now = await repository.headOf('pr');

    assert.deepStrictEqual(fixed, Result.ok({ kind: 'pushed', head: now }));

    assert.strictEqual(
      await gitOk(repository.origin, ['show', `${now}:fixed.txt`]),
      'fixed',
    );

    assert.strictEqual(
      await gitOk(repository.origin, ['rev-parse', `${now}^`]),
      await gitOk(repository.origin, ['rev-parse', `${head}^`]),
    );
  });

  test('declines when the fixer changed nothing, or failed', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const head = await onePr(repository);

    const unchanged = await fix(repository, head, {
      ...PLAN,
      commands: ['true'],
    });

    assert.isTrue(
      Result.isOk(unchanged) && unchanged.value.kind === 'declined',
    );

    const failed = await fix(repository, head, {
      ...PLAN,
      commands: ['echo broken; exit 1'],
    });

    assert.deepStrictEqual(
      failed,
      Result.ok({
        kind: 'declined',
        why: '`echo broken; exit 1` failed:\nbroken',
      }),
    );

    assert.strictEqual(await repository.headOf('pr'), head);
  });

  test('declines a branch of more than one commit', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    await repository.commit('one.txt', 'one\n', 'one');

    const head = await onePr(repository);

    const fixed = await fix(repository, head);

    assert.deepStrictEqual(
      fixed,
      Result.ok({
        kind: 'declined',
        why: 'the branch has 2 commits on main, and Auto-fix amends a branch of one',
      }),
    );
  });

  test('declines a fix to a path CODEOWNERS gives owners', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd } = repository.place;

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the temporary directory
    await fs.mkdir(path.join(cwd, '.github'));

    await repository.push(
      await repository.commit(
        '.github/CODEOWNERS',
        '/fixed.txt @owner\n',
        'owners',
      ),
      'main',
    );

    const head = await onePr(repository);

    const fixed = await fix(repository, head);

    assert.isTrue(
      Result.isOk(fixed) &&
        fixed.value.kind === 'declined' &&
        fixed.value.why.includes('gives owners'),
    );
  });

  test('says the branch moved when it is not at the head given', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    await onePr(repository);

    assert.deepStrictEqual(
      await fix(repository, 'f'.repeat(40)),
      Result.ok({ kind: 'moved' }),
    );
  });
});
