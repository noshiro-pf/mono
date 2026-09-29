/** The issues GitHub says a pull request closes, as a report lists them. */

import { Arr, Num, Result } from 'ts-data-forge';
import { type LinkedIssue, type RepoRef } from './types.mjs';

/**
 * One entry of GraphQL's `closingIssuesReferences.nodes`, asked for with
 * `number title url state repository { nameWithOwner }`. `null` is what
 * GraphQL puts in the list for an issue the token may not see.
 */
export type ClosingIssueNode = Readonly<{
  number: number;
  title: string;
  url: string;
  state: string;
  repository: Readonly<{ nameWithOwner: string }>;
}> | null;

/**
 * The closing issues that belong to `repo`, in GitHub's order.
 *
 * **Only this repository's.** A pull request can close an issue anywhere,
 * and a report lists each as `#N` — which for another repository's issue
 * names a different issue of this one, and for a private repository's may
 * put a title the report's reader cannot see into a report someone else
 * reads. The body parser `pr-report` falls back on without a token draws the
 * same line.
 *
 * `null` entries are skipped rather than rejected: one issue the token may
 * not see is no reason to lose the rest.
 */
export const closingIssuesIn = (
  repo: RepoRef,
  nodes: readonly ClosingIssueNode[],
): readonly LinkedIssue[] => {
  const own = `${repo.owner}/${repo.name}`.toLowerCase();

  return nodes.flatMap((node) =>
    node?.repository.nameWithOwner.toLowerCase() !== own
      ? []
      : [
          {
            number: node.number,
            title: node.title,
            url: node.url,
            state:
              node.state === 'OPEN'
                ? 'open'
                : node.state === 'CLOSED'
                  ? 'closed'
                  : 'unknown',
          },
        ],
  );
};

/**
 * The issues of `repo` a pull request body closes by keyword, as GitHub
 * itself read the body: first appearance order, each once.
 *
 * **Read from GitHub's rendering, not from the text.** GitHub wraps each
 * closing keyword it recognized in `<span class="issue-keyword">` and puts
 * the reference right after it, and it does so whatever the base branch.
 * `closingIssuesReferences` does not: it links a keyword only on a pull
 * request into the default branch, so a stacked one lists nothing until the
 * layers below it merge. Which spellings count, whether a reference inside
 * code or after a comma is closed, is GitHub's to decide, and this takes its
 * decision rather than copying the grammar. A body cannot forge the mark:
 * GitHub strips `class` from HTML written in one.
 *
 * A reference to another repository's issue, or to a pull request, is left
 * out, for the reasons {@link closingIssuesIn} gives.
 */
export const closingKeywordIssuesIn = (
  repo: RepoRef,
  bodyHtml: string,
): readonly number[] => {
  const own = `${repo.owner}/${repo.name}`.toLowerCase();

  return Arr.uniq(
    bodyHtml
      .matchAll(KEYWORD_THEN_LINK)
      .flatMap((match) => {
        const attributes = attributesOf(match.groups?.['attributes'] ?? '');

        const target = ISSUE_URL.exec(attributes.get('data-url') ?? '')?.groups;

        return attributes.get('data-hovercard-type') === 'issue' &&
          target?.['repo']?.toLowerCase() === own
          ? readNumber(target['number'] ?? '')
          : [];
      })
      .toArray(),
  );
};

/**
 * A keyword GitHub marked, then the link that follows it with only text in
 * between (`Closes #1`, `Fixes: #1`).
 */
const KEYWORD_THEN_LINK =
  /<span class="issue-keyword[ "][^>]*>[^<]*<\/span>[^<]*<a (?<attributes>[^>]*)>/gu;

const ISSUE_URL =
  /^https:\/\/github\.com\/(?<repo>[^/]+\/[^/]+)\/issues\/(?<number>\d+)$/u;

/** The attributes of a tag GitHub wrote, which always quotes them. */
const attributesOf = (attributes: string): ReadonlyMap<string, string> =>
  new Map(
    attributes
      .matchAll(ATTRIBUTE)
      .map(
        (match) =>
          [
            match.groups?.['name'] ?? '',
            match.groups?.['value'] ?? '',
          ] as const,
      ),
  );

const ATTRIBUTE = /(?<name>[\w-]+)="(?<value>[^"]*)"/gu;

const readNumber = (raw: string): readonly number[] => {
  const parsed = Num.safeParseInt(raw);

  return Result.isOk(parsed) ? [parsed.value] : [];
};
