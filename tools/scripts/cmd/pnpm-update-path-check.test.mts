import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Arr, Obj, Result } from 'ts-data-forge';
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

  // #4034: a types-only project's `tsconfig` is generated as the local
  // space's is, and refreshed here.
  test('accepts the tsconfig files of a published project refreshed from the local space', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(
        repo,
        `${PUBLISHED}/types/tsconfig.json`,
        '{\n  "compilerOptions": { "strict": true }\n}\n',
      );

      await write(
        repo,
        `${PUBLISHED}/strict-ts-lib-v7.0/tsconfig.paths.json`,
        '{ "paths": "current" }\n',
      );
    });

    expect(result.status, result.stdout).toBe(0);
  });

  test('accepts the tsconfig of a types-only project new to the published space', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${PUBLISHED}/fresh-types/package.json`, '{}\n');

      await write(
        repo,
        `${PUBLISHED}/fresh-types/tsconfig.json`,
        '{"fresh":true}\n',
      );
    });

    expect(result.status, result.stdout).toBe(0);
  });

  test('refuses a tsconfig that is not what the local space holds', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(
        repo,
        `${PUBLISHED}/types/tsconfig.json`,
        '{"include":["../../../../**"]}\n',
      );
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/types/tsconfig.json is not ${LOCAL}/types/tsconfig.json as HEAD has it`,
    );
  });

  // A valid value followed by more is not JSON, though jq reads the value.
  test('refuses a tsconfig that is the local JSON and more', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(
        repo,
        `${PUBLISHED}/types/tsconfig.json`,
        '{"compilerOptions":{"strict":true}}\n// trailing\n',
      );
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/types/tsconfig.json is not JSON`,
    );
  });

  test('refuses a tsconfig whose keys are in another order', async () => {
    const result = await runPathCheck(
      async (repo) => {
        await write(
          repo,
          `${PUBLISHED}/strict-ts-lib-v7.0/tsconfig.paths.json`,
          '{"b":1,"paths":"current"}\n',
        );
      },
      async (repo) => {
        await write(
          repo,
          `${LOCAL}/strict-ts-lib-v7.0/tsconfig.paths.json`,
          '{"paths":"current","b":1}\n',
        );
      },
    );

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/strict-ts-lib-v7.0/tsconfig.paths.json is not ${LOCAL}/strict-ts-lib-v7.0/tsconfig.paths.json as HEAD has it`,
    );
  });

  test('refuses a blank tsconfig as not JSON', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${PUBLISHED}/pkg/tsconfig.json`, '\n');
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/pkg/tsconfig.json is not JSON`,
    );
  });

  // `git show` prints a link's target and a file's text alike.
  test.each(['link', 'executable'] as const)(
    'refuses a tsconfig that is a %s',
    async (mode) => {
      const result = await runPathCheck(async (repo) => {
        const file = path.join(repo, PUBLISHED, 'types', 'tsconfig.json');

        await fs.rm(file);

        if (mode === 'link') {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          await fs.symlink('{"compilerOptions":{"strict":true}}', file);
        } else {
          await write(
            repo,
            `${PUBLISHED}/types/tsconfig.json`,
            '{"compilerOptions":{"strict":true}}\n',
          );

          // eslint-disable-next-line security/detect-non-literal-fs-filename
          await fs.chmod(file, 0o755);
        }
      });

      expect(result.status).toBe(1);

      expect(result.stdout).toContain(
        `${PUBLISHED}/types/tsconfig.json is not ${LOCAL}/types/tsconfig.json as HEAD has it`,
      );
    },
  );

  // TypeScript merges both `compilerOptions`, so the second must not hide the
  // first.
  test('refuses a tsconfig that gives a key twice', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(
        repo,
        `${PUBLISHED}/types/tsconfig.json`,
        '{"compilerOptions":{"noCheck":true},"compilerOptions":{"strict":true}}\n',
      );
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/types/tsconfig.json is not ${LOCAL}/types/tsconfig.json as HEAD has it`,
    );
  });

  // jq reads `NaN`, which JSON does not have, as null.
  test('refuses a tsconfig that is not JSON though jq reads it', async () => {
    const result = await runPathCheck(
      async (repo) => {
        await write(
          repo,
          `${PUBLISHED}/types/tsconfig.json`,
          '{"compilerOptions":{"strict":NaN}}\n',
        );
      },
      async (repo) => {
        await write(
          repo,
          `${LOCAL}/types/tsconfig.json`,
          '{"compilerOptions":{"strict":null}}\n',
        );
      },
    );

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/types/tsconfig.json is not JSON`,
    );
  });

  // The workflow names the files by a pattern of its own. Read from disk, not
  // as git tracks them: a file the generator has just written and nobody has
  // staged yet is one the next update would carry.
  test('names every tsconfig the generator writes into either space', async () => {
    const script = await readPathCheck();

    const pattern = /^tsconfig_copy='(?<pattern>.*)'$/mu.exec(script)?.groups?.[
      'pattern'
    ];

    assert.isDefined(pattern);

    // The local space too: a pull request regenerates it alone, so a file name
    // new to the generator shows there first, and the next update would carry
    // it into the published space. Each as the published path it becomes.
    const perSpace = await Promise.all(
      [PUBLISHED, LOCAL].map(async (space) => {
        const root = path.resolve(projectRootPath, space);

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const projects = await fs.readdir(root, { withFileTypes: true });

        const perProject = await Promise.all(
          projects
            .filter((entry) => entry.isDirectory())
            .map(async ({ name }) => {
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              const entries = await fs.readdir(path.join(root, name));

              // A directory with no manifest is what an earlier run left
              // behind, as the test of the checks' sources says.
              return entries.includes('package.json')
                ? entries
                    .filter((file) => /^tsconfig.*\.json$/u.test(file))
                    .map((file) => `${PUBLISHED}/${name}/${file}`)
                : [];
            }),
        );

        return perProject.flat();
      }),
    );

    const files = Arr.uniq(perSpace.flat());

    assert.isNotEmpty(files);

    // eslint-disable-next-line security/detect-non-literal-regexp
    const matches = new RegExp(pattern, 'u');

    for (const file of files) {
      expect(file).toMatch(matches);
    }
  });

  test('refuses an empty tsconfig', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${PUBLISHED}/types/tsconfig.json`, '');
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/types/tsconfig.json is not JSON`,
    );
  });

  test('refuses a tsconfig that starts with a byte order mark', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(
        repo,
        `${PUBLISHED}/types/tsconfig.json`,
        `${BYTE_ORDER_MARK}{"compilerOptions":{"strict":true}}\n`,
      );
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/types/tsconfig.json is not JSON`,
    );
  });

  // A failure of node itself is not a verdict on the file.
  test('says so when node cannot check a tsconfig', async () => {
    const result = await runPathCheck(
      async (repo) => {
        await write(
          repo,
          `${PUBLISHED}/types/tsconfig.json`,
          '{"compilerOptions":{"strict":true}}\n',
        );
      },
      undefined,
      { failingNode: true },
    );

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `node could not check ${PUBLISHED}/types/tsconfig.json (exit 1)`,
    );
  });

  // git's failure is not a verdict on the file.
  test('says so when git cannot read a staged tsconfig', async () => {
    const result = await runPathCheck(
      async (repo) => {
        await write(
          repo,
          `${PUBLISHED}/types/tsconfig.json`,
          '{"compilerOptions":{"strict":"unreadable"}}\n',
        );
      },
      undefined,
      { unreadableStaged: `${PUBLISHED}/types/tsconfig.json` },
    );

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `git could not read ${PUBLISHED}/types/tsconfig.json`,
    );
  });

  // The pathspec of the copy also matches a directory of that name.
  test('refuses a directory put in place of a tsconfig', async () => {
    const result = await runPathCheck(async (repo) => {
      await fs.rm(path.join(repo, PUBLISHED, 'types', 'tsconfig.json'));

      await write(
        repo,
        `${PUBLISHED}/types/tsconfig.json/package.json`,
        '{}\n',
      );
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/types/tsconfig.json is not ${LOCAL}/types/tsconfig.json as HEAD has it`,
    );
  });

  // A shell variable would drop it, and the text left would pass.
  test('refuses a tsconfig holding a NUL', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(
        repo,
        `${PUBLISHED}/types/tsconfig.json`,
        '{"compilerOptions":{"str\0ict":true}}\n',
      );
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/types/tsconfig.json is not JSON`,
    );
  });

  test('refuses a tsconfig that is not UTF-8', async () => {
    const result = await runPathCheck(async (repo) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(
        path.join(repo, PUBLISHED, 'types', 'tsconfig.json'),
        Buffer.from(
          '{"compilerOptions":{"strict":true},"x":"\u{FF}"}\n',
          'latin1',
        ),
      );
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/types/tsconfig.json is not JSON`,
    );
  });

  // Only a types-only project has one, in either space.
  test('refuses a tsconfig the local space does not have', async () => {
    const result = await runPathCheck(async (repo) => {
      await write(repo, `${PUBLISHED}/pkg/tsconfig.json`, '{}\n');
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/pkg/tsconfig.json is not ${LOCAL}/pkg/tsconfig.json as HEAD has it`,
    );
  });

  test('refuses a deleted tsconfig', async () => {
    const result = await runPathCheck(async (repo) => {
      await fs.rm(
        path.join(repo, PUBLISHED, 'strict-ts-lib-v7.0', 'tsconfig.paths.json'),
      );
    });

    expect(result.status).toBe(1);

    expect(result.stdout).toContain(
      `${PUBLISHED}/strict-ts-lib-v7.0/tsconfig.paths.json is not ${LOCAL}/strict-ts-lib-v7.0/tsconfig.paths.json as HEAD has it`,
    );
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

const BYTE_ORDER_MARK = String.fromCodePoint(0xfe_ff);

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
 * holds each published `tsconfig` to the local space's. Read from the workflow
 * so that what is tested is what runs.
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

  assert.isAtLeast(start, 0);

  // The last loop before the pin file's check: the one holding the copies of a
  // check to `smoke/`, then the one holding a `tsconfig` to the local space.
  const pins = lines.findIndex(
    (line, index) => index > start && line.startsWith('pins='),
  );

  const end = lines.findLastIndex(
    (line, index) => index < pins && line.startsWith('done < <('),
  );

  // The pin file's check (`pins=`) follows the loops; a rename shows here.
  assert.isAbove(pins, start);

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
  {
    failingNode = false,
    unreadableStaged,
  }: Readonly<{ failingNode?: boolean; unreadableStaged?: string }> = {},
): Promise<ProcessResult> => {
  const script = await readPathCheck();

  const repo = await makeScratchDir();

  // The block's temporary files go here, and so does a `node` that fails, first
  // on the PATH, when asked for.
  const tools = await makeScratchDir();

  if (failingNode) {
    await write(tools, 'bin/node', '#!/bin/sh\nexit 1\n');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.chmod(path.join(tools, 'bin', 'node'), 0o755);
  }

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

  await write(
    repo,
    `${LOCAL}/types/tsconfig.json`,
    '{"compilerOptions":{"strict":true}}\n',
  );

  await write(
    repo,
    `${LOCAL}/strict-ts-lib-v7.0/tsconfig.paths.json`,
    '{"paths":"current"}\n',
  );

  await write(repo, `${LOCAL}/fresh-types/tsconfig.json`, '{"fresh":true}\n');

  await write(
    repo,
    `${PUBLISHED}/types/tsconfig.json`,
    '{"compilerOptions":{"strict":false}}\n',
  );

  await write(
    repo,
    `${PUBLISHED}/strict-ts-lib-v7.0/tsconfig.paths.json`,
    '{"paths":"stale"}\n',
  );

  await base(repo);

  await git('add', '-A');

  await git('commit', '--quiet', '-m', 'base');

  await change(repo);

  await git('add', '-A');

  // Staged as an object the repository does not have (its id hashed and not
  // written), so that reading it fails however git stores its objects.
  if (unreadableStaged !== undefined) {
    const hashed = await runFile('git', ['hash-object', '--stdin'], {
      cwd: repo,
      env: scratchGitEnv(),
      input: 'never written\n',
    });

    expect(hashed.status, hashed.stderr).toBe(0);

    await git(
      'update-index',
      '--cacheinfo',
      `100644,${hashed.stdout.trim()},${unreadableStaged}`,
    );
  }

  // As GitHub runs a `run:` block that names no shell.
  const checked = await runFile('bash', ['-e', '-c', script], {
    cwd: repo,
    env: {
      ...scratchGitEnv(),
      RUNNER_TEMP: tools,
      PATH: `${path.join(tools, 'bin')}${path.delimiter}${process.env['PATH'] ?? ''}`,
    },
  });

  // The block removes what it wrote there, whichever way it ended.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const left = await fs.readdir(tools);

  expect(left.filter((name) => name !== 'bin')).toStrictEqual([]);

  return checked;
};
