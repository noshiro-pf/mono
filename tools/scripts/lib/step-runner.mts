import { spawn } from 'node:child_process';
import * as fsSync from 'node:fs';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';
import { runFile } from './child-process.mjs';

/**
 * What `check-changed`, `z:ci-job` and `check-all` share to run a step: one
 * `pnpm` invocation with the same environment, and the working tree before and
 * after it, so that each can say which step wrote what. The clean-tree check of
 * a CI job (`z:ci-job`) and `check-changed`'s report of a generator's writes
 * are the same comparison.
 */

/**
 * Runs `pnpm` with the given arguments in a repository-relative directory, its
 * output passed straight through, and resolves to its exit code.
 */
export const spawnPnpm = ({
  args,
  cwd,
  env,
}: Readonly<{
  args: readonly string[];
  /** Repository-relative. */
  cwd: string;
  /** What the step adds to the environment. */
  env: ReadonlyRecord<string, string>;
}>): Promise<number> =>
  new Promise((resolve) => {
    const child = spawn('pnpm', args, {
      cwd: path.join(projectRootPath, cwd),
      env: { ...process.env, ...env },
      stdio: 'inherit',
    });

    child.on('error', () => {
      resolve(COMMAND_NOT_RUN);
    });

    child.on('close', (code) => {
      resolve(code ?? 1);
    });
  });

/**
 * Every path `git status` lists (untracked ones included, ignored ones not),
 * with the hash of its content, or `not a file` for one that is not a regular
 * file.
 */
export const snapshotTree = async (): Promise<ReadonlyMap<string, string>> => {
  const files = splitZ(
    await git([
      'status',
      '--porcelain=v1',
      '-z',
      '--untracked-files=all',
      '--no-renames',
    ]),
  ).map((entry) => entry.slice(STATUS_PREFIX_LENGTH));

  // One `git hash-object` for all of them. It fails as a whole on a path that
  // is not a regular file — deleted, or the `dir/` of an untracked nested
  // repository — so those are set apart first.
  const hashed = files.filter(isRegularFile);

  const hashOutput = Arr.isEmpty(hashed)
    ? undefined
    : await git(['hash-object', '--stdin-paths'], hashed.join('\n'));

  const hashes =
    hashOutput === undefined ? ([] as const) : hashOutput.split('\n');

  const hashOf = new Map(hashed.map((file, i) => [file, hashes[i] ?? '']));

  return new Map(files.map((file) => [file, hashOf.get(file) ?? 'not a file']));
};

/** The paths whose content differs between two {@link snapshotTree}s. */
export const diffSnapshots = (
  before: ReadonlyMap<string, string>,
  after: ReadonlyMap<string, string>,
): readonly string[] =>
  Arr.uniq([...before.keys(), ...after.keys()])
    .filter((file) => before.get(file) !== after.get(file))
    .toSorted();

/** Runs git in the repository and returns its output, throwing on failure. */
export const git = async (
  args: readonly string[],
  input?: string,
): Promise<string> => {
  const result = await runFile('git', args, {
    cwd: projectRootPath,
    maxBuffer: GIT_MAX_BUFFER,
    ...(input === undefined ? {} : { input }),
  });

  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed:\n${result.stderr}`);
  }

  return result.stdout;
};

/** `-z` output split into its entries. */
export const splitZ = (output: string): readonly string[] =>
  output.split('\0').filter((entry) => entry !== '');

/** Whether a repository-relative path is a regular file now. */
export const isRegularFile = (file: string): boolean => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path git status listed.
    return fsSync.statSync(path.join(projectRootPath, file)).isFile();
  } catch {
    return false;
  }
};

/** The shell's "command not found", for a `pnpm` that could not be spawned. */
export const COMMAND_NOT_RUN = 127;

/** `XY ` before each path of `git status --porcelain=v1`. */
const STATUS_PREFIX_LENGTH = 3;

const GIT_MAX_BUFFER = 256 * 1024 * 1024;
