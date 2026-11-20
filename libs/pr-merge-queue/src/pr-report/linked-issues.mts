/** The issues a pull request body says it closes. */

import {
  CLOSING_ISSUE_NUMBER,
  closingKeywordBefore,
  isRepoNamed,
  readIssueNumber,
  type RepoRef,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import { shownMatches } from '../markdown/index.mjs';

/**
 * The issue numbers a body declares this pull request closes, in the order they
 * first appear.
 *
 * An approximation of GitHub's grammar, for an answer that carries only the
 * text: the merged list, and an open pull request answered without `body_html`.
 * Where the rendering is at hand, `closingKeywordIssuesIn` reads GitHub's own
 * decision instead. A change to this grammar should err toward reading a
 * keyword GitHub would not act on; `linkedIssuesOf` says why.
 * `pr-description/body.mts` reads the same keywords (`pr-report-core`'s
 * `closingKeywordBefore`).
 *
 * A link made by hand in the sidebar, which only the GraphQL API lists, is not
 * in the body, and a reference to another repository's issue is left out
 * deliberately, since it cannot be rendered as a local `#N`.
 *
 * Read in the text the body shows (`proseBlocks`), so that code, fenced or
 * indented, code spans and HTML comments are skipped where a Markdown parser
 * says they are, since GitHub shows none of them as text.
 */
export const parseClosingIssueRefs = (
  body: string,
  repo: RepoRef,
): readonly number[] =>
  Arr.uniq(
    shownMatches(body, CLOSING_REFERENCE).flatMap(({ groups }) => {
      const { number, shortRepo, shortNumber, urlRepo, urlNumber } = groups;

      const named =
        number ??
        (isRepoNamed(repo, shortRepo) ? shortNumber : undefined) ??
        (isRepoNamed(repo, urlRepo) ? urlNumber : undefined);

      return named === undefined ? [] : readIssueNumber(named);
    }),
  );

/**
 * A closing keyword, followed by `#12`, `owner/repo#12` or the issue's URL, in a
 * body folded to ASCII lower case.
 *
 * Only a closing keyword is read. A body mentioning `#12` in a sentence is a
 * cross-reference — GitHub closes nothing for it, and reporting it as "the
 * issue this pull request is for" would make every mention of another pull
 * request look like a link.
 *
 * Where it differs from GitHub, on the side of reading (see
 * `parseClosingIssueRefs`):
 *
 * - A `#N` naming a pull request is read. GitHub's rendering leaves it out by its
 *   hovercard type; the text cannot tell a pull request's number from an
 *   issue's. A pull request's URL is not read, since its path says which it is.
 * - A URL with an upper-case scheme, host or path is read, since the body is
 *   folded whole. Whether GitHub reads one is not established.
 * - With nothing between the keyword and the reference, next to a letter
 *   outside ASCII (`#12を`), and after a space
 *   outside ASCII (`Fixes\u3000#12`), as `closingKeywordBefore` says.
 */
const CLOSING_REFERENCE = closingKeywordBefore(
  String.raw`(?:#(?<number>${CLOSING_ISSUE_NUMBER})|(?<shortRepo>[\w.-]+\/[\w.-]+)#(?<shortNumber>${CLOSING_ISSUE_NUMBER})|https?:\/\/github\.com\/(?<urlRepo>[\w.-]+\/[\w.-]+)\/issues\/(?<urlNumber>${CLOSING_ISSUE_NUMBER}))`,
);
