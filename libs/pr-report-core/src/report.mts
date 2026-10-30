/** Everything read, arranged into what gets rendered. */

import { Arr } from 'ts-data-forge';
import { summarizeChecks } from './checks.mjs';
import { SKIP_CI_LABEL } from './labels.mjs';
import { parseMergeAfter } from './merge-after.mjs';
import { findStackParents } from './stack.mjs';
import {
  decideStartStates,
  inheritStartAfter,
  issuesInProgress,
  progressOf,
  withProgress,
  type ReferenceStatus,
} from './start-after.mjs';
import { buildMergeAfterForest } from './tree.mjs';
import type {
  IssueDeclarations,
  MergedPullRequest,
  OpenIssue,
  PrReport,
  PullRequestFacts,
  RepoRef,
  ReportEntry,
  ReportIssue,
  TreeNode,
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
  issues,
  issuesLimit,
  issueDeclarations,
  references = new Map<number, ReferenceStatus>(),
}: Readonly<{
  repo: RepoRef;
  defaultBranch: string;
  generatedAt: string;
  required: readonly string[];
  authenticated: boolean;
  pulls: readonly PullRequestFacts[];
  merged: readonly MergedPullRequest[];
  mergedWithinDays: number;
  issues: readonly OpenIssue[];
  issuesLimit: number;
  /** See {@link buildEntries}. */
  issueDeclarations?: IssueDeclarations;
  /**
   * Where each number the issues' `Start-After:` names stands, for what is
   * neither a listed issue nor an open pull request; one missing is unknown.
   */
  references?: ReadonlyMap<number, ReferenceStatus>;
}>): PrReport =>
  ({
    repo,
    defaultBranch,
    generatedAt,
    authenticated,
    required,
    ...buildEntries({
      required,
      defaultBranch,
      pulls,
      ...(issueDeclarations === undefined ? {} : { issues: issueDeclarations }),
    }),
    merged,
    mergedWithinDays,
    issues: reportIssues(issues, pulls, references),
    issuesLimit,
  }) as const;

/**
 * Each open issue with how it stands for being started
 * (`docs/issue-start-after.md`): its start state, or how far someone has
 * got with it when it is startable (`progressOf`), and where each thing it
 * names stands.
 */
const reportIssues = (
  issues: readonly OpenIssue[],
  pulls: readonly PullRequestFacts[],
  references: ReadonlyMap<number, ReferenceStatus>,
): readonly ReportIssue[] => {
  const listed = new Set(issues.map(({ number }) => number));

  const open = new Set(pulls.map(({ number }) => number));

  const statusOf = (number: number): ReferenceStatus =>
    listed.has(number) || open.has(number)
      ? 'waiting'
      : (references.get(number) ?? 'unknown');

  const states = decideStartStates(issues, statusOf);

  const worked = issuesInProgress(pulls);

  return issues.map((issue) => ({
    ...issue,
    start: withProgress(
      states.get(issue.number) ?? 'free',
      progressOf(issue.labels, worked.has(issue.number)),
    ),
    named: issue.startAfter.map((number) => ({
      number,
      status: statusOf(number),
    })),
  }));
};

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
  issues = NO_DECLARATIONS,
  skipCiPauses = true,
}: Readonly<{
  /**
   * The contexts the ruleset requires, or `undefined` for a repository that
   * declares none: each pull request is then judged over every context
   * reported on its head.
   */
  required: readonly string[] | undefined;
  defaultBranch: string;
  pulls: readonly PullRequestFacts[];
  /**
   * What the issues the pull requests close declare, which each inherits;
   * none read, none inherited.
   */
  issues?: IssueDeclarations;
  /**
   * Whether the `skip-ci` label means what it means here — the checks held
   * back, so the verdict is `paused` — which is so wherever `unblock-prs`'s
   * queue runs. Elsewhere it is a label like any other, and the checks are
   * judged as they stand.
   */
  skipCiPauses?: boolean;
}>): DecidedEntries => {
  const open = new Set(pulls.map(({ number }) => number));

  const parents = findStackParents(pulls, defaultBranch);

  const inherited = inheritStartAfter({
    pulls: pulls.map(({ number, linkedIssues }) => ({
      number,
      closes: notKnownClosed(linkedIssues),
    })),
    startAfterOf: issues.startAfter,
    openIssues: new Set(
      Arr.generate(function* () {
        yield* issues.open;

        for (const { linkedIssues } of pulls) {
          for (const { number, state } of linkedIssues) {
            if (state === 'open') {
              yield number;
            }
          }
        }
      }),
    ),
  });

  const entries: readonly ReportEntry[] = pulls
    .toSorted((a, b) => a.number - b.number)
    .map((facts) => {
      const mergeAfter = parseMergeAfter(facts.body);

      const stackedOn = parents.get(facts.number);

      const declared = Arr.uniq(
        stackedOn === undefined
          ? mergeAfter
          : Arr.toUnshifted(stackedOn)(mergeAfter),
      );

      const inheritedOrder = inherited.get(facts.number);

      const inheritedMergeAfter = (inheritedOrder?.mergeAfter ?? []).filter(
        (n) => !declared.includes(n),
      );

      return {
        ...facts,
        mergeAfter,
        stackedOn,
        inheritedMergeAfter,
        notStartedIssues: inheritedOrder?.notStarted ?? [],
        blockedBy: [...declared, ...inheritedMergeAfter].filter((n) =>
          open.has(n),
        ),
        checks: summarizeChecks({
          required: required ?? Array.from(facts.reported.keys()).toSorted(),
          reported: facts.reported,
          paused:
            skipCiPauses &&
            facts.labels.some((label) => label.name === SKIP_CI_LABEL),
          running: facts.checksRunning,
          // The ruleset's own condition: `~DEFAULT_BRANCH` and `main`.
          baseCovered: facts.baseRef === defaultBranch,
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

const NO_DECLARATIONS: IssueDeclarations = {
  startAfter: new Map<number, readonly number[]>(),
  open: new Set<number>(),
} as const;

/**
 * The issues a pull request closes that may still declare an order: any not
 * known to be closed. One read from the body without a token has an
 * `unknown` state, and is given the benefit of the doubt.
 */
const notKnownClosed = (
  linkedIssues: PullRequestFacts['linkedIssues'],
): readonly number[] =>
  linkedIssues
    .filter(({ state }) => state !== 'closed')
    .map(({ number }) => number);
