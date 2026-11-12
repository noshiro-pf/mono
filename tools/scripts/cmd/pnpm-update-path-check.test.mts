import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Obj, Result } from 'ts-data-forge';
import { runFile, type ProcessResult } from '../lib/child-process.mjs';
import { readWorkflowJobs } from '../lib/workflow-jobs.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { smokeFileName, smokeSourceName } from './verify-npm-packages.mjs';

/**
 * The path check of `pnpm-update.yml`'s `commit` job is shell written inline
 * (the workflow says why), so nothing type-checks it and no pull request runs
 * it: a mistake in it shows as a scheduled run failing, which nobody is told
 * about. This runs the block itself, cut out of the workflow, against a scratch
 * repository whose index holds what a patch would have applied.
 */
describe('the path check of pnpm-update.yml', () => {
  test('accepts the manifests and the lockfile', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, 'pnpm-lock.yaml', 'moved\n');

      await write(repo, `${PUBLISHED}/pkg/package.json`, '{"moved":true}\n');
    });

    expect(result.status, result.stdout).toBe(0);
  });

  test('accepts published checks refreshed from smoke/', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${PUBLISHED}/pkg/pkg.mjs`, 'current pkg\n');

      await write(repo, `${PUBLISHED}/types/types.mts`, 'current types\n');

      await write(
        repo,
        `${PUBLISHED}/strict-ts-lib-v7.0/strict-ts-lib-v7.0.mts`,
        'current strict\n',
      );
    });

    expect(result.status, result.stdout).toBe(0);
  });

  test('accepts the check of a project new to the published space', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${PUBLISHED}/fresh/package.json`, '{}\n');

      await write(repo, `${PUBLISHED}/fresh/fresh.mjs`, 'current fresh\n');
    });

    expect(result.status, result.stdout).toBe(0);
  });

  test('reads the source of every published project as the generator does', async () => {
    // The shell names a copy's source itself, and `smokeSourceName` names it
    // for the generator: every project the published space holds has to get the
    // same answer from both.
    const published = path.resolve(projectRootPath, PUBLISHED);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const entries = await fs.readdir(published, { withFileTypes: true });

    const found = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async ({ name }) => {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          const files = await fs.readdir(path.join(published, name));

          // A directory with no manifest is what an earlier run left behind (an
          // ignored `node_modules`), not a project.
          if (!files.includes('package.json')) {
            return [];
          }

          const check = smokeFileName(name);

          expect(files, name).toContain(check);

          return [{ name, check, source: smokeSourceName(name) } as const];
        }),
    );

    const copies = found.flat();

    assert.isNotEmpty(copies);

    const result = await runPathCheck(
      async (repo) => {
        for (const { name, check, source } of copies) {
          await write(repo, `${PUBLISHED}/${name}/${check}`, `// ${source}\n`);
        }
      },
      // Each real project holds a stale copy of a source that says its own
      // name, so that a copy refreshed from any other source is refused.
      async (repo) => {
        for (const { name, check, source } of copies) {
          await write(repo, `${SMOKE}/${source}`, `// ${source}\n`);

          await write(repo, `${PUBLISHED}/${name}/${check}`, 'stale\n');
        }
      },
    );

    expect(result.status, result.stdout).toBe(0);
  });

  test('refuses a check that is not what smoke/ holds', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${PUBLISHED}/pkg/pkg.mjs`, 'current pkg\nmore\n');
    });

    assert.strictEqual(result.status, 1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/pkg/pkg.mjs is not a copy of ${SMOKE}/pkg.mjs as HEAD has it`,
    );
  });

  test('refuses a strict library check that is not the shared one', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(
        repo,
        `${PUBLISHED}/strict-ts-lib-v7.0/strict-ts-lib-v7.0.mts`,
        'current types\n',
      );
    });

    assert.strictEqual(result.status, 1);

    expect(result.stdout).toContain(
      `is not a copy of ${SMOKE}/strict-ts-lib.mts as HEAD has it`,
    );
  });

  test('refuses a check with no source under smoke/', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${PUBLISHED}/other/other.mjs`, 'anything\n');
    });

    assert.strictEqual(result.status, 1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/other/other.mjs is not a copy of`,
    );
  });

  test('refuses a deleted check', async () => {
    const result = await runPathCheck(async (repo) => {
      await fs.rm(path.join(repo, `${PUBLISHED}/pkg/pkg.mjs`));
    });

    assert.strictEqual(result.status, 1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/pkg/pkg.mjs is not a copy of`,
    );
  });

  test('refuses a deleted check whose source is gone too', async () => {
    const result = await runPathCheck(async (repo) => {
      await fs.rm(path.join(repo, `${PUBLISHED}/orphan/orphan.mjs`));
    });

    assert.strictEqual(result.status, 1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/orphan/orphan.mjs is not a copy of`,
    );
  });

  test('refuses another program beside the check', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${PUBLISHED}/pkg/pkg.mjs`, 'current pkg\n');

      await write(repo, `${PUBLISHED}/pkg/helper.mjs`, 'current pkg\n');
    });

    assert.strictEqual(result.status, 1);

    expect(result.stdout).toContain('paths a dependency update does not write');

    expect(result.stdout).toContain(`${PUBLISHED}/pkg/helper.mjs`);
  });

  test('refuses a change to smoke/ itself', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${SMOKE}/pkg.mjs`, 'rewritten\n');

      await write(repo, `${PUBLISHED}/pkg/pkg.mjs`, 'rewritten\n');
    });

    assert.strictEqual(result.status, 1);

    expect(result.stdout).toContain('paths a dependency update does not write');
  });

  test('stops when the staged paths cannot be read', async () => {
    const script = await readPathCheck();

    // Not a repository, so `git diff --cached` fails: that must not read as a
    // patch that carries nothing.
    const result = await runFile('bash', ['-e', '-c', script], {
      cwd: await makeScratchDir(),
      env: scratchGitEnv(),
    });

    // What `git diff` exits with when it is given no repository.
    expect(result.status, result.stderr).toBe(129);
  });

  test('refuses a check in the local space', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${LOCAL}/pkg/pkg.mjs`, 'current pkg\n');
    });

    assert.strictEqual(result.status, 1);

    expect(result.stdout).toContain(`${LOCAL}/pkg/pkg.mjs`);
  });
});

const SMOKE = 'verify-npm-packages/smoke';

const PUBLISHED = 'verify-npm-packages/published/packages';

const LOCAL = 'verify-npm-packages/local/packages';

/**
 * The environment the scratch repository's `git` runs in: no settings of
 * whoever runs the test, and none of the `GIT_*` variables a hook or
 * `git rebase --exec` exports, which would point it at the real repository.
 */
const scratchGitEnv = (): NodeJS.ProcessEnv =>
  ({
    ...Obj.filter(process.env, (_value, key) => !key.startsWith('GIT_')),
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    // No repository above the temporary directory either, wherever that is.
    GIT_CEILING_DIRECTORIES: os.tmpdir(),
  }) as const;

/**
 * The lines of the `commit` job's script that decide which paths a patch may
 * carry: from the pattern naming a published check to the end of the loop that
 * holds each one to `smoke/`. Read from the workflow so that what is tested is
 * what runs.
 */
const readPathCheck = async (): Promise<string> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await fs.readFile(
    path.resolve(projectRootPath, '.github/workflows/pnpm-update.yml'),
    'utf8',
  );

  const jobs = readWorkflowJobs(text);

  assert.isTrue(Result.isOk(jobs));

  const script = jobs.value
    .find((job) => job.name === 'commit')
    ?.steps.map((step) => step.run ?? '')
    .find((run) => run.includes('smoke_copy='));

  assert.isDefined(script);

  const lines = script.split('\n');

  const start = lines.findIndex((line) => line.startsWith('smoke_copy='));

  const end = lines.findIndex(
    (line, index) => index > start && line.startsWith('done < <('),
  );

  assert.isAtLeast(start, 0);

  assert.isAbove(end, start);

  return lines.slice(start, end + 1).join('\n');
};

const write = async (
  repo: string,
  file: string,
  content: string,
): Promise<void> => {
  const absolute = path.join(repo, file);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(path.dirname(absolute), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(absolute, content);
};

const makeScratchDir = async (): Promise<string> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pnpm-update-paths-'));

  onTestFinished(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  return dir;
};

/**
 * Runs the path check in a repository whose `HEAD` is the base commit and whose
 * index holds what `change` wrote on top of it, as the job's is after
 * `git apply` and `git add -A`. `base`, the second argument though it runs
 * first, adds files of its own to the base commit.
 */
const runPathCheck = async (
  change: (root: string) => Promise<void>,
  base: (root: string) => Promise<void> = async () => {},
): Promise<ProcessResult> => {
  const script = await readPathCheck();

  const repo = await makeScratchDir();

  const git = async (...args: readonly string[]): Promise<void> => {
    const result = await runFile(
      'git',
      [
        '-c',
        'user.name=test',
        '-c',
        'user.email=test@example.com',
        '-c',
        'core.hooksPath=/dev/null',
        ...args,
      ],
      { cwd: repo, env: scratchGitEnv() },
    );

    expect(result.status, result.stderr).toBe(0);
  };

  await git('init', '--quiet');

  await write(repo, 'pnpm-lock.yaml', 'lock\n');

  await write(repo, `${SMOKE}/pkg.mjs`, 'current pkg\n');

  await write(repo, `${SMOKE}/types.mts`, 'current types\n');

  await write(repo, `${SMOKE}/fresh.mjs`, 'current fresh\n');

  await write(repo, `${SMOKE}/strict-ts-lib.mts`, 'current strict\n');

  await write(repo, `${PUBLISHED}/pkg/package.json`, '{}\n');

  await write(repo, `${PUBLISHED}/pkg/pkg.mjs`, 'stale pkg\n');

  await write(repo, `${PUBLISHED}/types/types.mts`, 'stale types\n');

  await write(
    repo,
    `${PUBLISHED}/strict-ts-lib-v7.0/strict-ts-lib-v7.0.mts`,
    'stale strict\n',
  );

  await write(repo, `${PUBLISHED}/orphan/orphan.mjs`, 'orphan\n');

  await write(repo, `${LOCAL}/pkg/pkg.mjs`, 'stale pkg\n');

  await base(repo);

  await git('add', '-A');

  await git('commit', '--quiet', '-m', 'base');

  await change(repo);

  await git('add', '-A');

  // As GitHub runs a `run:` block that names no shell.
  return runFile('bash', ['-e', '-c', script], {
    cwd: repo,
    env: scratchGitEnv(),
  });
};
