/** The issues a pull request body says it closes. */

import { outsideCodeFences, type RepoRef } from 'pr-report-core';
import { Arr, Num, Result } from 'ts-data-forge';

/**
 * The keywords GitHub acts on, followed by `#12` or by the issue's URL.
 *
 * Only a closing keyword is read. A body mentioning `#12` in a sentence is a
 * cross-reference — GitHub closes nothing for it, and reporting it as "the
 * issue this pull request is for" would make every mention of another pull
 * request look like a link.
 */
const CLOSING_REFERENCE =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\b[^\S\n]*:?[^\S\n]*(?:#(?<number>\d+)|https:\/\/github\.com\/(?<owner>[\w.-]+)\/(?<repo>[\w.-]+)\/issues\/(?<urlNumber>\d+))\b/giu;

/**
 * The issue numbers a body declares this pull request closes, in the order
 * they first appear.
 *
 * Read from the body rather than from GitHub's own list because that list is
 * only in the GraphQL API, which needs a token. What this misses is a link
 * made by hand in the sidebar, and a reference to another repository's issue
 * — deliberately, since neither can be rendered as a local `#N`.
 *
 * Fenced code is skipped for the same reason `Merge-After:` skips it.
 */
export const parseClosingIssueRefs = (
  body: string,
  repo: RepoRef,
): readonly number[] =>
  Arr.uniq(
    outsideCodeFences(body)
      .matchAll(CLOSING_REFERENCE)
      .flatMap((match) => {
        const { number, owner, repo: name, urlNumber } = match.groups ?? {};

        return number !== undefined
          ? readNumber(number)
          : owner === repo.owner && name === repo.name
            ? readNumber(urlNumber ?? '')
            : [];
      })
      .toArray(),
  );

const readNumber = (raw: string): readonly number[] => {
  const parsed = Num.safeParseInt(raw);

  return Result.isOk(parsed) ? [parsed.value] : [];
};
