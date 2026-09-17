import { execFile, type ExecException } from 'node:child_process';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { $ } from './exec-async.mjs';

/**
 * Get the git repository root directory
 */
export const getGitRoot = async (
  options?: Readonly<{ silent?: boolean }>,
): Promise<Result<string, ExecException | Readonly<{ message: string }>>> => {
  const result = await $('git rev-parse --show-toplevel', {
    silent: options?.silent ?? false,
  });

  if (Result.isErr(result)) {
    return result;
  }

  return Result.ok(result.value.stdout.trim());
};

/**
 * Get untracked files from the working tree (files not added to git). Runs `git
 * ls-files --others --exclude-standard [--deleted]`
 */
export const getUntrackedFiles = async (
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> =>
  cmdResultToFiles({
    args: ['ls-files', '--others', '--exclude-standard'],
    argsToExcludeDeleted: [],
    argsToIncludeDeleted: ['--deleted'],
    options,
  });

/**
 * Get modified files from the working tree (files that have been changed but
 * not staged). Runs `git diff --name-only [--diff-filter=d]`
 */
export const getModifiedFiles = async (
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> =>
  cmdResultToFiles({
    args: ['diff', '--name-only'],
    argsToExcludeDeleted: ['--diff-filter=d'], // lower case 'd' means exclude deleted files
    argsToIncludeDeleted: [],
    options,
  });

/**
 * Get files that are staged for commit (files added with git add). Runs `git
 * diff --staged --name-only [--diff-filter=d]`
 */
export const getStagedFiles = async (
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> =>
  cmdResultToFiles({
    args: ['diff', '--staged', '--name-only'],
    argsToExcludeDeleted: ['--diff-filter=d'], // lower case 'd' means exclude deleted files
    argsToIncludeDeleted: [],
    options,
  });

/**
 * Get files that differ from the specified base branch or commit. Runs `git
 * diff --name-only [--diff-filter=d] <base> --`
 *
 * `base` names exactly one revision. It reaches `git` as a single argument and
 * never as a command line, so whatever it contains — whitespace, punctuation —
 * is part of the revision name rather than further arguments, and a `base` that
 * git does not resolve comes back as an `Err`. A value beginning with `-` is
 * rejected before git is invoked, because git would read it as an option.
 *
 * `base` is the only caller-supplied value this module puts on a git
 * invocation, which makes the two properties above the ones to preserve: see
 * {@link execGit} for why they are handled as data rather than as text, and
 * `tools/scripts/cmd/unblock-prs/util.mts` in this repository for the same
 * leading-`-` rule applied to refs from an untrusted source.
 */
export const getDiffFrom = async (
  base: string,
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> => {
  if (base.startsWith('-')) {
    return Result.err({
      message: `Invalid base "${base}": a base must name a revision, not an option.`,
    });
  }

  return cmdResultToFiles({
    args: ['diff', '--name-only'],
    argsToExcludeDeleted: ['--diff-filter=d'],
    argsToIncludeDeleted: [],
    // `--` ends the revision list, so a base that happens to match a path in
    // the working tree is still read as a revision.
    trailingArgs: [base, '--'],
    options,
  });
};

const cmdResultToFiles = async ({
  args,
  argsToExcludeDeleted,
  argsToIncludeDeleted,
  trailingArgs = [],
  options,
}: Readonly<{
  args: readonly string[];
  argsToExcludeDeleted: readonly string[];
  argsToIncludeDeleted: readonly string[];
  trailingArgs?: readonly string[];
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>;
}>): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> => {
  // Get git root directory
  const gitRootResult = await getGitRoot({ silent: options?.silent ?? false });

  if (Result.isErr(gitRootResult)) {
    return gitRootResult;
  }

  const gitRoot = gitRootResult.value;

  const result = await execGit(
    [
      ...args,
      ...((options?.excludeDeleted ?? true)
        ? argsToExcludeDeleted
        : argsToIncludeDeleted),
      ...trailingArgs,
    ],
    {
      silent: options?.silent ?? false,
      // Run git from the repository root so that `git ls-files` (which
      // defaults to cwd-relative paths) and other commands return paths
      // relative to the repository root, matching the `path.join(gitRoot, …)`
      // computation below regardless of the caller's current working
      // directory.
      cwd: gitRoot,
    },
  );

  if (Result.isErr(result)) {
    return result;
  }

  const { stdout } = result.value;

  // Parse git output and convert to absolute paths
  const files = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((relativePath) => path.join(gitRoot, relativePath));

  return Result.ok(files);
};

/**
 * Runs `git` with `args` handed to the process one argument at a time. No shell
 * is involved, so each entry of `args` arrives at git exactly as written.
 *
 * **This is deliberately not {@link $}, and the difference is a security
 * boundary rather than a matter of taste.** `$` takes a _command line_ and runs
 * it through a shell (see its own documentation, which says so). The values
 * these functions pass come from their callers, and a caller's value is data:
 * a branch name, a commit-ish. Interpolating data into a command line makes the
 * shell — and then `git`'s own option parser — read parts of it as syntax, so a
 * caller that happens to have wired an externally-influenced value into `base`
 * would be handing whoever controls that value the ability to run commands in
 * the process, or to write files through options like `git diff --output=`.
 * That is not hypothetical for a published library: `base` is documented as a
 * branch name or commit hash, so nothing warns a consumer that the value has to
 * be shell-safe, and a ref name may legitimately contain characters a shell
 * treats as syntax.
 *
 * With `execFile` there is no command line to be part of. Every element of
 * `args` is one argv entry, whatever it contains — whitespace, punctuation,
 * anything — so data cannot become commands or extra options.
 *
 * Keep it that way: do not rewrite this to build a string, and do not route
 * caller-supplied values through `$`.
 */
const execGit = async (
  args: readonly string[],
  options: Readonly<{ silent: boolean; cwd: string }>,
): Promise<
  Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
> => {
  const { silent, cwd } = options;

  if (!silent) {
    console.info(`$ git ${args.join(' ')}`);
  }

  return new Promise((resolve) => {
    execFile(
      'git',
      args,
      { cwd, encoding: 'utf8' },
      (error, stdout, stderr) => {
        if (!silent) {
          if (stdout !== '') {
            console.info(stdout);
          }

          if (stderr !== '') {
            console.error(stderr);
          }
        }

        resolve(
          error === null
            ? Result.ok<Readonly<{ stdout: string; stderr: string }>>({
                stdout,
                stderr,
              })
            : Result.err(error),
        );
      },
    );
  });
};
