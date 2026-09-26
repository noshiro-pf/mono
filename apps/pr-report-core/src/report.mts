/** Everything read, arranged into what gets rendered. */

import { Arr } from 'ts-data-forge';
import { summarizeChecks } from './checks.mjs';
import { SKIP_CI_LABEL } from './labels.mjs';
import { parseMergeAfter } from './merge-after.mjs';
import { findStackParents } from './stack.mjs';
import { buildMergeAfterForest } from './tree.mjs';
import {
  type MergedPullRequest,
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
  defaultBranch,
  generatedAt,
  required,
  authenticated,
  pulls,
  merged,
  mergedWithinDays,
}: Readonly<{
  repo: RepoRef;
  defaultBranch: string;
  generatedAt: string;
  required: readonly string[];
  authenticated: boolean;
  pulls: readonly PullRequestFacts[];
  merged: readonly MergedPullRequest[];
  mergedWithinDays: number;
}>): PrReport =>
  ({
    repo,
    defaultBranch,
    generatedAt,
    authenticated,
    required,
    ...buildEntries({ required, defaultBranch, pulls }),
    merged,
    mergedWithinDays,
  }) as const;

export type DecidedEntries = Readonly<{
  entries: readonly ReportEntry[];
  roots: readonly TreeNode[];
  cycles: readonly (readonly number[])[];
}>;

/**
 * The part of a report that is decided rather than read: each open pull
 * request's declared order, the stack it is in, its check verdict, and the
 * merge order they add up to.
 */
export const buildEntries = ({
  required,
  defaultBranch,
  pulls,
}: Readonly<{
  required: readonly string[];
  defaultBranch: string;
  pulls: readonly PullRequestFacts[];
}>): DecidedEntries => {
  const open = new Set(pulls.map(({ number }) => number));

  const parents = findStackParents(pulls, defaultBranch);

  const entries: readonly ReportEntry[] = pulls
    .toSorted((a, b) => a.number - b.number)
    .map((facts) => {
      const mergeAfter = parseMergeAfter(facts.body);

      const stackedOn = parents.get(facts.number);

      return {
        ...facts,
        mergeAfter,
        stackedOn,
        blockedBy: Arr.uniq(
          stackedOn === undefined
            ? mergeAfter
            : Arr.toUnshifted(stackedOn)(mergeAfter),
        ).filter((n) => open.has(n)),
        checks: summarizeChecks({
          required,
          reported: facts.reported,
          paused: facts.labels.some((label) => label.name === SKIP_CI_LABEL),
        }),
      };
    });

  // The forest reads what each entry waits for, which for a stacked one
  // includes the layer below it.
  const { roots, cycles } = buildMergeAfterForest(
    entries.map(({ number, blockedBy }) => ({
      number,
      mergeAfter: blockedBy,
    })),
  );

  return { entries, roots, cycles };
};
