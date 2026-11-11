// cspell:ignore gpgsign
/**
 * A repository to move branches in: a bare `origin` and a clone of it, under a
 * temporary directory, with a committer set, so that the git module runs
 * against real git.
 */

import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import * as util from 'node:util';

/**
 * Runs git in `cwd`, in `env` when given, failing the test on an error; what it
 * printed, trimmed.
 */
export const gitOk = async (
  cwd: string,
  args: readonly string[],
  env?: Readonly<NodeJS.ProcessEnv>,
): Promise<string> => {
  const { stdout } = await util.promisify(execFile)('git', args, {
    cwd,
    ...(env === undefined ? {} : { env }),
  });

  return stdout.trim();
};

/** Sets a committer in `clone`, and commits unsigned, so that it can commit. */
export const setCommitter = async (clone: string): Promise<void> => {
  for (const [key, value] of [
    ['user.name', 'test'],
    ['user.email', 'test@example.com'],
    ['commit.gpgsign', 'false'],
  ] as const) {
    // One at a time: each writes the clone's config.
    // eslint-disable-next-line no-await-in-loop
    await gitOk(clone, ['config', key, value]);
  }
};

/**
 * A clone with `main` at one commit, pushed, and a worktree root beside it.
 * `dispose` removes the lot.
 */
export const makeRepository = async (): Promise<GitRepository> => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mq-v2-git-'));

  const origin = path.join(root, 'origin.git');

  const clone = path.join(root, 'clone');

  await gitOk(root, [
    'init',
    '--quiet',
    '--bare',
    '--initial-branch=main',
    origin,
  ]);

  await gitOk(root, ['clone', '--quiet', origin, clone]);

  await setCommitter(clone);

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the temporary directory
  await fs.mkdir(path.join(root, 'worktrees'));

  const repository: GitRepository = {
    place: { cwd: clone, worktreeRoot: path.join(root, 'worktrees') },
    origin,
    commit: async (file, text, message) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the temporary directory
      await fs.mkdir(path.dirname(path.join(clone, file)), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the temporary directory
      await fs.writeFile(path.join(clone, file), text);

      await gitOk(clone, ['add', file]);

      await gitOk(clone, ['commit', '--quiet', '-m', message]);

      return gitOk(clone, ['rev-parse', 'HEAD']);
    },
    push: async (sha, branch) => {
      await gitOk(clone, [
        'push',
        '--quiet',
        '--force',
        'origin',
        `${sha}:refs/heads/${branch}`,
      ]);
    },
    headOf: async (branch) =>
      gitOk(origin, ['rev-parse', `refs/heads/${branch}`]),
    dispose: async () => {
      await fs.rm(root, { recursive: true, force: true });
    },
  } as const;

  await gitOk(clone, ['checkout', '--quiet', '-b', 'main']);

  await repository.push(
    await repository.commit('base.txt', 'base\n', 'base'),
    'main',
  );

  return repository;
};

export type GitRepository = Readonly<{
  place: Readonly<{ cwd: string; worktreeRoot: string }>;
  /** The bare repository the clone's `origin` is, for another clone of it. */
  origin: string;
  /** Writes `file` in the clone's working tree and commits it on what is checked out. */
  commit: (file: string, text: string, message: string) => Promise<string>;
  /** Force-pushes `sha` to `branch` on `origin`, as another writer would. */
  push: (sha: string, branch: string) => Promise<void>;
  /** The head of `branch` on `origin`. */
  headOf: (branch: string) => Promise<string>;
  dispose: () => Promise<void>;
}>;
