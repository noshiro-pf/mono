// cspell:ignore RRGGBB

/**
 * The machine-readable copy of the pull request report: what `pr-report`
 * writes into its issue, and what the Pull Requests Manager app reads back.
 *
 * It exists because the app cannot ask GitHub itself. Reading one pull
 * request costs three requests — the comparison against the base and the two
 * kinds of check — so twenty of them spend the 60 an hour an anonymous
 * browser gets before the page has finished loading once. The report already
 * pays that cost, in a job with a token, once a day and on every event that
 * can change the answer; the app reads what it wrote.
 *
 * The shape lives here, in a package both sides depend on, rather than being
 * declared twice. Two copies of it would agree until the day a field moved,
 * and the failure would be a page that renders nothing with no check having
 * said why.
 */

import * as t from 'ts-fortress';

/**
 * What this package writes and reads.
 *
 * The app is deployed from `main` and the issue it reads was written by
 * whatever ran last, so the two can be of different ages in either direction.
 * The number is what lets the app say which, instead of failing validation on
 * a field it has never heard of.
 */
export const PAYLOAD_VERSION = 1;

/** What one pull request's required contexts have reported, in summary. */
export type PayloadChecks = Readonly<{
  verdict: 'failing' | 'passed' | 'paused' | 'pending';
  failed: readonly string[];
  pending: readonly string[];
  missing: readonly string[];
  required: number;
}>;

/**
 * A label as GitHub holds it, colour and all.
 *
 * The colour is carried because a chip that is not the colour GitHub shows is
 * a chip a reader has to translate. It is six hex digits with no `#`, which
 * is exactly what the API sends.
 */
export type PayloadLabel = Readonly<{
  name: string;
  /** `RRGGBB`, no leading `#`. */
  color: string;
  description: string;
}>;

/** An issue the pull request closes. */
export type PayloadLinkedIssue = Readonly<{
  number: number;
  /** Empty when the report ran without a token and read the body instead. */
  title: string;
  url: string;
  state: 'closed' | 'open' | 'unknown';
}>;

/** Commits the head has that the base does not, and the other way round. */
export type PayloadComparison = Readonly<{
  aheadBy: number;
  behindBy: number;
}>;

/**
 * One pull request in the merge order the `Merge-After:` trailers declare.
 * `repeated` marks the second and later appearances of one that named more
 * than one predecessor: drawn under each, expanded under the first only.
 */
export type PayloadTreeNode = Readonly<{
  number: number;
  repeated: boolean;
  children: readonly PayloadTreeNode[];
}>;

/**
 * One open pull request.
 *
 * Deliberately not the whole of what `pr-report --format json` prints. The
 * body is left out — it is the largest field by far and the only thing read
 * out of it, the `Merge-After:` numbers and the closing keywords, is already
 * here — and so is the per-context map, whose verdicts {@link PayloadChecks}
 * summarises. An issue body holds 65536 characters and both of those grow
 * with the number of pull requests.
 */
export type PayloadEntry = Readonly<{
  number: number;
  title: string;
  author: string;
  url: string;
  isDraft: boolean;
  labels: readonly PayloadLabel[];
  /** Whether auto-merge is armed, which the `merge-queued` label is not. */
  autoMerge: boolean;
  headRef: string;
  baseRef: string;
  updatedAt: string;
  /** `null` when the comparison could not be read. */
  comparison: PayloadComparison | null;
  linkedIssues: readonly PayloadLinkedIssue[];
  /** Every number the body declared, open or not. */
  mergeAfter: readonly number[];
  /** The subset of it still open, and so still constraining. */
  blockedBy: readonly number[];
  checks: PayloadChecks;
}>;

/**
 * The counts the report leads with.
 *
 * Carried rather than recomputed, because two of them are questions only the
 * writer can answer without knowing this repository's conventions: `queued` is
 * the `merge-queued` label, whose string lives in the workflows and in
 * `tools/scripts/cmd/unblock-prs/`, and `failing` is the verdict the report
 * reached over the contexts its ruleset requires. An app that counted labels
 * itself would be a third place to change the day one of them is renamed.
 */
export type PayloadSummary = Readonly<{
  open: number;
  /** Labelled `merge-queued`: the author saying it is to be landed. */
  queued: number;
  draft: number;
  failing: number;
  /** Behind the base, which the ruleset refuses to merge. */
  behind: number;
}>;

/**
 * One pull request that has already landed.
 *
 * A separate shape rather than a {@link PayloadEntry} with the fields blanked
 * out: nothing that is true of an open pull request — a merge order, a
 * verdict, a distance from its base — is true of one that has merged, and a
 * type that admitted both would be a type whose every field has to be
 * checked before it is read.
 */
export type PayloadMerged = Readonly<{
  number: number;
  title: string;
  author: string;
  url: string;
  headRef: string;
  baseRef: string;
  mergedAt: string;
  mergedAtEpochMs: number;
  labels: readonly PayloadLabel[];
  /**
   * The issues the body declared with a closing keyword. GitHub's own list
   * is GraphQL-only and is read for the open pull requests; a merged one is
   * history, and its body is what is left to read it from.
   */
  linkedIssues: readonly PayloadLinkedIssue[];
}>;

export type PrReportPayload = Readonly<{
  version: number;
  repo: Readonly<{ owner: string; name: string }>;
  /** ISO 8601, for a reader of the issue. */
  generatedAt: string;
  /**
   * The same instant as milliseconds since the epoch, for a reader that has
   * to do arithmetic with it.
   *
   * Written by the side that knows, because parsing a date *string* is the
   * one operation whose result the specification leaves to the
   * implementation. A page that says "generated 3 hours ago" would be
   * computing that from an implementation-defined parse; subtracting two
   * numbers is neither.
   */
  generatedAtEpochMs: number;
  /** Whether the report ran with a token, which decides how much it knew. */
  authenticated: boolean;
  /** The contexts `repo-settings/rulesets/main.json` requires. */
  required: readonly string[];
  summary: PayloadSummary;
  /** Every open pull request, lowest number first. */
  entries: readonly PayloadEntry[];
  /** The merge order as a forest. Pull requests on a cycle are not in it. */
  roots: readonly PayloadTreeNode[];
  cycles: readonly (readonly number[])[];
  /** Merged within {@link PrReportPayload.mergedWithinDays}, newest first. */
  merged: readonly PayloadMerged[];
  /** How far back the list above goes, so a page can say so. */
  mergedWithinDays: number;
}>;

export const PayloadChecksSchema: t.Type<PayloadChecks> = t.record({
  verdict: t.enumType(['failing', 'passed', 'paused', 'pending']),
  failed: t.array(t.string()),
  pending: t.array(t.string()),
  missing: t.array(t.string()),
  required: t.number(),
});

export const PayloadLabelSchema: t.Type<PayloadLabel> = t.record({
  name: t.string(),
  color: t.string(),
  description: t.string(),
});

export const PayloadLinkedIssueSchema: t.Type<PayloadLinkedIssue> = t.record({
  number: t.number(),
  title: t.string(),
  url: t.string(),
  state: t.enumType(['closed', 'open', 'unknown']),
});

export const PayloadComparisonSchema: t.Type<PayloadComparison> = t.record({
  aheadBy: t.number(),
  behindBy: t.number(),
});

/**
 * `nullType` first, as `t.recursion`'s own documentation asks: a union
 * resolves its default value eagerly, and a recursive member in first place
 * would not terminate.
 */
export const PayloadTreeNodeSchema: t.Type<PayloadTreeNode> = t.recursion(
  'PayloadTreeNode',
  () =>
    t.record({
      number: t.number(),
      repeated: t.boolean(),
      children: t.array(PayloadTreeNodeSchema),
    }),
);

export const PayloadSummarySchema: t.Type<PayloadSummary> = t.record({
  open: t.number(),
  queued: t.number(),
  draft: t.number(),
  failing: t.number(),
  behind: t.number(),
});

export const PayloadEntrySchema: t.Type<PayloadEntry> = t.record({
  number: t.number(),
  title: t.string(),
  author: t.string(),
  url: t.string(),
  isDraft: t.boolean(),
  labels: t.array(PayloadLabelSchema),
  autoMerge: t.boolean(),
  headRef: t.string(),
  baseRef: t.string(),
  updatedAt: t.string(),
  comparison: t.union([t.nullType, PayloadComparisonSchema]),
  linkedIssues: t.array(PayloadLinkedIssueSchema),
  mergeAfter: t.array(t.number()),
  blockedBy: t.array(t.number()),
  checks: PayloadChecksSchema,
});

export const PayloadMergedSchema: t.Type<PayloadMerged> = t.record({
  number: t.number(),
  title: t.string(),
  author: t.string(),
  url: t.string(),
  headRef: t.string(),
  baseRef: t.string(),
  mergedAt: t.string(),
  mergedAtEpochMs: t.number(),
  labels: t.array(PayloadLabelSchema),
  linkedIssues: t.array(PayloadLinkedIssueSchema),
});

/**
 * Excess properties are accepted, which is `t.record`'s default and the right
 * one here: a newer report may carry a field this app has no use for yet, and
 * refusing the whole payload over it would take the page down to add
 * something nothing was reading.
 */
export const PrReportPayloadSchema: t.Type<PrReportPayload> = t.record({
  version: t.number(),
  repo: t.record({ owner: t.string(), name: t.string() }),
  generatedAt: t.string(),
  generatedAtEpochMs: t.number(),
  authenticated: t.boolean(),
  required: t.array(t.string()),
  summary: PayloadSummarySchema,
  entries: t.array(PayloadEntrySchema),
  roots: t.array(PayloadTreeNodeSchema),
  cycles: t.array(t.array(t.number())),
  merged: t.array(PayloadMergedSchema),
  mergedWithinDays: t.number(),
});
