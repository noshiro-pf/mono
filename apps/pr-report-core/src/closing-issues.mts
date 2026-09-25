/** The issues GitHub says a pull request closes, as a report lists them. */

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
