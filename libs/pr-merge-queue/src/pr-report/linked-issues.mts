/** The issues a pull request body says it closes. */

import { outsideCodeFences, type RepoRef } from 'pr-report-core';
import { Arr, Num, Result } from 'ts-data-forge';

/**
 * A closing keyword, followed by `#12` or by the issue's URL, in a body folded
 * to ASCII lower case.
 *
 * Only a closing keyword is read. A body mentioning `#12` in a sentence is a
 * cross-reference — GitHub closes nothing for it, and reporting it as "the
 * issue this pull request is for" would make every mention of another pull
 * request look like a link.
 */
const CLOSING_REFERENCE =
  // No `i` flag: the body is folded to ASCII lower case first, so the letters,
  // `\w` and `\b` are ASCII alone. With `iu` they would also take U+017F LATIN
  // SMALL LETTER LONG S and U+212A KELVIN SIGN, which Unicode folds to `s` and
  // `k`.
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\b[^\S\n]*:?[^\S\n]*(?:#(?<number>\d+)|https:\/\/github\.com\/(?<repoPath>[\w.-]+\/[\w.-]+)\/issues\/(?<urlNumber>\d+))\b/gu;

/**
 * The issue numbers a body declares this pull request closes, in the order they
 * first appear.
 *
 * An approximation of GitHub's grammar, for an answer that carries only the
 * text: the merged list, and an open pull request answered without `body_html`.
 * Where the rendering is at hand, `closingKeywordIssuesIn` reads GitHub's own
 * decision instead. A change to this grammar should err toward reading a
 * keyword GitHub would not act on; `linkedIssuesOf` says why.
 * `pr-description/body.mts` reads the same keywords with a grammar of its own.
 *
 * A link made by hand in the sidebar, which only the GraphQL API lists, is not
 * in the body, and a reference to another repository's issue is left out
 * deliberately, since it cannot be rendered as a local `#N`.
 *
 * Fenced code is skipped for the same reason `Merge-After:` skips it.
 */
export const parseClosingIssueRefs = (
  body: string,
  repo: RepoRef,
): readonly number[] => {
  // Owner and repository names are case-insensitive on GitHub. Compared here
  // rather than through `isSameRepo`, which lives in a module that reads files.
  // `toLowerCase`, as `closingIssuesIn` and `closingKeywordIssuesIn` fold it,
  // so the text and the rendering compare the same key. It differs from the
  // body's ASCII fold only on a non-ASCII `RepoRef`, which names no repository
  // GitHub answers for.
  const own = `${repo.owner}/${repo.name}`.toLowerCase();

  return Arr.uniq(
    asciiLowerCase(outsideCodeFences(body))
      .matchAll(CLOSING_REFERENCE)
      .flatMap((match) => {
        const { number, repoPath, urlNumber } = match.groups ?? {};

        return number !== undefined
          ? readNumber(number)
          : repoPath === own
            ? readNumber(urlNumber ?? '')
            : [];
      })
      .toArray(),
  );
};

// `toLowerCase` would fold U+212A KELVIN SIGN in a body to `k`, so a name
// GitHub never gives could compare equal to this repository's.
const asciiLowerCase = (text: string): string =>
  text.replaceAll(/[A-Z]/gu, (letter) => letter.toLowerCase());

// A copy of `readNumber` in `pr-report-core`'s `closing-issues.mts`, which does
// not export it; sharing it would add to that package's published API.
const readNumber = (raw: string): readonly number[] => {
  const parsed = Num.safeParseInt(raw);

  return Result.isOk(parsed) ? [parsed.value] : [];
};
