/**
 * What the declared order means for picking a pull request, as a note, and
 * the order the issues the pull requests close add to it. Reading the
 * `Merge-After:` trailers and the `Start-After:` lines, finding the cycles in
 * them and deciding that a pull request waits is `pr-report-core`'s, because
 * the Pull Requests Manager page draws the same queue.
 */

import { closingKeywordIssuesIn, waitsFor, type RepoRef } from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { Classification, IssueOrder, PullRequest } from './types.mjs';

/**
 * The note to report instead of picking this pull request while what it
 * must merge after is still open. Picking is all this constrains: a pull
 * request that is already up to date and merging is left to auto-merge,
 * which takes no notice of anything declared here.
 */
export const waitingOnNote = (
  pr: PullRequest,
  on: readonly number[],
  cyclic: boolean,
  inherited: readonly number[] = [],
): Classification => {
  const fromIssues = on.filter((number) => inherited.includes(number));

  return {
    kind: 'note',
    note: `#${pr.number}: Merge-After ${on.map((number) => `#${number}`).join(', ')}, still open${
      Arr.isNonEmpty(fromIssues)
        ? ` (${fromIssues.map((number) => `#${number}`).join(', ')} from the Start-After of an issue it closes)`
        : ''
    }${
      cyclic
        ? ' — and on a Merge-After cycle, so nothing here will move it'
        : ''
    }`,
  } as const;
};

/** One issue as the closing-issue reads answer it. */
export type ClosingIssueAnswer = Readonly<{
  number: number;
  /** `OPEN` or `CLOSED`. */
  state: string;
  body: string;
  /** The issues of this repository GitHub records as blocking it. */
  blockedBy: readonly number[];
}>;

/**
 * Which open issues each pull request closes, and what those declare with
 * `Start-After:`, for `queueGraph` to inherit.
 *
 * An issue closes when GitHub links it (`linked`, this repository's only) or
 * when the body closes it by keyword, as GitHub marked it in `bodyHtml` —
 * the one way to tell for a stacked pull request, which GitHub links
 * nothing on. `described` is what was read of the keyword ones GitHub did
 * not link; one it would not describe is left out, being unknown.
 */
export const issueOrderOf = (
  repo: RepoRef,
  pulls: readonly Readonly<{
    number: number;
    bodyHtml: string;
    linked: readonly ClosingIssueAnswer[];
  }>[],
  described: ReadonlyMap<number, ClosingIssueAnswer>,
): IssueOrder => {
  const mut_issues = new Map(described);

  for (const issue of pulls.flatMap(({ linked }) => linked)) {
    mut_issues.set(issue.number, issue);
  }

  const issues: ReadonlyMap<number, ClosingIssueAnswer> = mut_issues;

  const isOpen = (number: number): boolean =>
    issues.get(number)?.state.toUpperCase() === 'OPEN';

  return {
    closes: new Map(
      pulls.map(({ number, bodyHtml, linked }) => [
        number,
        Arr.uniq([
          ...linked.map((issue) => issue.number),
          ...closingKeywordIssuesIn(repo, bodyHtml),
        ]).filter(isOpen),
      ]),
    ),
    startAfter: new Map(
      Array.from(issues.values(), ({ number, body, blockedBy }) => [
        number,
        waitsFor(body, blockedBy),
      ]),
    ),
  } as const;
};

/** The keyword-closed issues of `pulls` that GitHub did not link. */
export const unlinkedClosingIssues = (
  repo: RepoRef,
  pulls: readonly Readonly<{
    bodyHtml: string;
    linked: readonly ClosingIssueAnswer[];
  }>[],
): readonly number[] => {
  const linked = new Set(
    pulls.flatMap((pull) => pull.linked.map(({ number }) => number)),
  );

  return Arr.uniq(
    pulls.flatMap(({ bodyHtml }) => closingKeywordIssuesIn(repo, bodyHtml)),
  )
    .filter((number) => !linked.has(number))
    .toSorted((a, b) => a - b);
};
