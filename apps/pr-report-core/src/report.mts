/** Everything read, arranged into what gets rendered. */

import { summarizeChecks } from './checks.mjs';
import { SKIP_CI_LABEL } from './labels.mjs';
import { parseMergeAfter } from './merge-after.mjs';
import { buildMergeAfterForest } from './tree.mjs';
import {
  type MergedPullRequest,
  type OpenIssue,
  type PrReport,
  type PullRequestFacts,
  type RepoRef,
  type ReportEntry,
  type TreeNode,
} from './types.mjs';

/**
 * Reads the declared merge order and the check verdicts out of the facts.
 *
 * Nothing here talks to GitHub, which is what lets the whole shape of a
 * report be tested against a handful of literals.
 */
export const buildReport = ({
  repo,
  generatedAt,
  required,
  authenticated,
  pulls,
  merged,
  mergedWithinDays,
  issues,
  issuesLimit,
}: Readonly<{
  repo: RepoRef;
  generatedAt: string;
  required: readonly string[];
  authenticated: boolean;
  pulls: readonly PullRequestFacts[];
  merged: readonly MergedPullRequest[];
  mergedWithinDays: number;
  issues: readonly OpenIssue[];
  issuesLimit: number;
}>): PrReport =>
  ({
    repo,
    generatedAt,
    authenticated,
    required,
    ...buildEntries({ required, pulls }),
    merged,
    mergedWithinDays,
    issues,
    issuesLimit,
  }) as const;

export type DecidedEntries = Readonly<{
  entries: readonly ReportEntry[];
  roots: readonly TreeNode[];
  cycles: readonly (readonly number[])[];
}>;

/**
 * The part of a report that is decided rather than read: each open pull
 * request's declared order and check verdict, and the merge order they add
 * up to.
 */
export const buildEntries = ({
  required,
  pulls,
}: Readonly<{
  required: readonly string[];
  pulls: readonly PullRequestFacts[];
}>): DecidedEntries => {
  const open = new Set(pulls.map(({ number }) => number));

  const entries: readonly ReportEntry[] = pulls
    .toSorted((a, b) => a.number - b.number)
    .map((facts) => {
      const mergeAfter = parseMergeAfter(facts.body);

      return {
        ...facts,
        mergeAfter,
        blockedBy: mergeAfter.filter((n) => open.has(n)),
        checks: summarizeChecks({
          required,
          reported: facts.reported,
          paused: facts.labels.some((label) => label.name === SKIP_CI_LABEL),
          running: facts.checksRunning,
        }),
      };
    });

  const { roots, cycles } = buildMergeAfterForest(entries);

  return { entries, roots, cycles };
};
