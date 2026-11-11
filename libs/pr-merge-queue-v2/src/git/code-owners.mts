/**
 * What `CODEOWNERS` gives owners, read from a commit: a change a fixer or a
 * generator wrote and the queue pushes in its own name is not anyone's review
 * of it, so one that touches an owned path is left to a person.
 */

import { ownersOf, parseCodeOwners } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import { git } from './run.mjs';

/** Which of `files` the `CODEOWNERS` text `codeOwners` gives owners. */
export const ownedOf = (
  files: readonly string[],
  codeOwners: string,
): readonly string[] => {
  const rules = parseCodeOwners(codeOwners);

  return files.filter((file) => Arr.isNonEmpty(ownersOf(file, rules)));
};

/**
 * `CODEOWNERS` at `ref`: `''` when there is none, an error when it cannot be
 * read, which declines rather than reading as empty.
 */
export const codeOwnersAt = async (
  worktree: string,
  ref: string,
): Promise<Result<string, string>> => {
  const listed = await git(worktree, [
    'ls-tree',
    '--name-only',
    ref,
    '--',
    CODE_OWNERS_PATH,
  ]);

  return Result.isErr(listed)
    ? Result.err(`cannot list ${CODE_OWNERS_PATH}: ${listed.value}`)
    : listed.value.trim() === ''
      ? Result.ok('')
      : git(worktree, ['show', `${ref}:${CODE_OWNERS_PATH}`]);
};

const CODE_OWNERS_PATH = '.github/CODEOWNERS';
