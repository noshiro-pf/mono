/**
 * Whether a name GitHub gave back is a given repository, and the number read
 * from a reference to one of its issues. Reads no files, so a reader of answers
 * can use it.
 */

import { Num, Result } from 'ts-data-forge';
import type { RepoRef } from './types.mjs';

/**
 * Whether `nameWithOwner` — `owner/name`, as GitHub gives `full_name`,
 * `nameWithOwner` or the path of an issue URL — names `repo`. `undefined`, as
 * the head of a pull request from a deleted fork answers, names none.
 *
 * **Case is ignored**, as GitHub ignores it in both names, so a `RepoRef` spelt
 * `Noshiro-PF/Mono` is the repository GitHub calls `noshiro-pf/mono`. ASCII
 * letters alone are folded: `toLowerCase` would also fold U+212A KELVIN SIGN to
 * `k`, making a name GitHub never gives equal to this one.
 */
export const isRepoNamed = (
  repo: RepoRef,
  nameWithOwner: string | undefined,
): boolean =>
  nameWithOwner !== undefined &&
  asciiLowerCase(nameWithOwner) ===
    asciiLowerCase(`${repo.owner}/${repo.name}`);

/**
 * Whether `url` is the REST API URL of `repo`, as an issue's `repository_url`
 * gives it: a URL whose path ends in `/repos/{owner}/{name}`, the names
 * compared as {@link isRepoNamed} compares them. What comes before `/repos/` —
 * the host, and a root such as GitHub Enterprise's `/api/v3` — is not read, so
 * pass only a URL the API's own answer carried: one from anywhere else could
 * name any host.
 */
export const isRepoApiUrl = (repo: RepoRef, url: string): boolean => {
  if (!URL.canParse(url)) {
    return false;
  }

  const { pathname } = new URL(url);

  return asciiLowerCase(pathname).endsWith(
    asciiLowerCase(`/repos/${repo.owner}/${repo.name}`),
  );
};

/**
 * Whether `a` and `b` name one repository, each name compared as
 * {@link isRepoNamed} compares them.
 */
export const isSameRepo = (a: RepoRef, b: RepoRef): boolean =>
  asciiLowerCase(a.owner) === asciiLowerCase(b.owner) &&
  asciiLowerCase(a.name) === asciiLowerCase(b.name);

/**
 * The issue number `digits` spells — the digits a pattern captured from a
 * reference such as `#12` or an issue URL — as a list to `flatMap`: the number,
 * or nothing for text that is not decimal digits alone or names no safe
 * integer.
 */
export const readIssueNumber = (digits: string): readonly number[] => {
  if (!DIGITS.test(digits)) {
    return [];
  }

  const parsed = Num.safeParseInt(digits);

  // `safeParseInt` reads twenty nines as 1e20, a number no issue has.
  return Result.isOk(parsed) && Number.isSafeInteger(parsed.value)
    ? [parsed.value]
    : [];
};

const DIGITS = /^\d+$/u;

const asciiLowerCase = (text: string): string =>
  text.replaceAll(/[A-Z]/gu, (letter) => letter.toLowerCase());
