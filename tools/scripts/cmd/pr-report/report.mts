/** Everything read, arranged into what gets rendered. */

import { SKIP_CI_LABEL } from '../unblock-prs/labels.mjs';
import { parseMergeAfter } from '../unblock-prs/merge-after.mjs';
import { summarizeChecks } from './checks.mjs';
import { buildMergeAfterForest } from './tree.mjs';
import {
  type PrReport,
  type PullRequestFacts,
  type RepoRef,
  type ReportEntry,
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
}: Readonly<{
  repo: RepoRef;
  generatedAt: string;
  required: readonly string[];
  authenticated: boolean;
  pulls: readonly PullRequestFacts[];
}>): PrReport => {
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
          paused: facts.labels.includes(SKIP_CI_LABEL),
        }),
      };
    });

  const { roots, cycles } = buildMergeAfterForest(entries);

  return {
    repo,
    generatedAt,
    authenticated,
    required,
    entries,
    roots,
    cycles,
  };
};
