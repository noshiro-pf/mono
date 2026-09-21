// cspell:ignore RRGGBB

/**
 * The machine-readable copy of the pull request report: what `pr-report`
 * writes to its branch, and what the Pull Requests Manager app reads back.
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
 *
 * **Each schema is the declaration and each type is derived from it** with
 * `t.TypeOf`, as `libs/github-settings-as-code` does. Writing the type out as
 * well and annotating the schema `t.Type<X>` would be checked — the two
 * cannot silently disagree — but it is still the same shape said twice, and
 * every union would have its members listed twice over. The one exception is
 * {@link PayloadTreeNode}, and it says why where it is.
 */

import * as t from 'ts-fortress';

/**
 * What this package writes and reads.
 *
 * The app is deployed from `main` and the file it reads was written by
 * whatever ran last, so the two can be of different ages in either direction.
 * The number is what lets the app say which, instead of failing validation on
 * a field it has never heard of.
 */
export const PAYLOAD_VERSION = 1;

/** What one pull request's required contexts have reported, in summary. */
export const PayloadChecksSchema = t.record({
  verdict: t.enumType(['failing', 'passed', 'paused', 'pending']),
  failed: t.array(t.string()),
  pending: t.array(t.string()),
  missing: t.array(t.string()),
  required: t.number(),
});

export type PayloadChecks = t.TypeOf<typeof PayloadChecksSchema>;

/**
 * A label as GitHub holds it, colour and all.
 *
 * The colour is carried because a chip that is not the colour GitHub shows is
 * a chip a reader has to translate. It is six hex digits with no `#`, which
 * is exactly what the API sends.
 */
export const PayloadLabelSchema = t.record({
  name: t.string(),
  /** `RRGGBB`, no leading `#`. */
  color: t.string(),
  description: t.string(),
});

export type PayloadLabel = t.TypeOf<typeof PayloadLabelSchema>;

/** An issue the pull request closes. */
export const PayloadLinkedIssueSchema = t.record({
  number: t.number(),
  /** Empty when the report ran without a token and read the body instead. */
  title: t.string(),
  url: t.string(),
  state: t.enumType(['closed', 'open', 'unknown']),
});

export type PayloadLinkedIssue = t.TypeOf<typeof PayloadLinkedIssueSchema>;

/** Commits the head has that the base does not, and the other way round. */
export const PayloadComparisonSchema = t.record({
  aheadBy: t.number(),
  behindBy: t.number(),
});

export type PayloadComparison = t.TypeOf<typeof PayloadComparisonSchema>;

/**
 * One pull request in the merge order the `Merge-After:` trailers declare.
 * `repeated` marks the second and later appearances of one that named more
 * than one predecessor: drawn under each, expanded under the first only.
 *
 * **The one type here written out rather than derived**, because it cannot
 * be: the schema names itself, and a `t.recursion` with no type to annotate
 * it is `error TS7022, 'PayloadTreeNode' implicitly has type 'any' because
 * it does not have a type annotation and is referenced directly or
 * indirectly in its own initializer`. The annotation below is what breaks
 * that cycle, so the two halves are checked against each other instead.
 */
export type PayloadTreeNode = Readonly<{
  number: number;
  repeated: boolean;
  children: readonly PayloadTreeNode[];
}>;

export const PayloadTreeNodeSchema: t.Type<PayloadTreeNode> = t.recursion(
  'PayloadTreeNode',
  () =>
    t.record({
      number: t.number(),
      repeated: t.boolean(),
      children: t.array(PayloadTreeNodeSchema),
    }),
);

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
export const PayloadSummarySchema = t.record({
  open: t.number(),
  /** Labelled `merge-queued`: the author saying it is to be landed. */
  queued: t.number(),
  draft: t.number(),
  failing: t.number(),
  /** Behind the base, which the ruleset refuses to merge. */
  behind: t.number(),
});

export type PayloadSummary = t.TypeOf<typeof PayloadSummarySchema>;

/**
 * One open pull request.
 *
 * Deliberately not the whole of what `pr-report --format json` prints. The
 * body is left out — it is the largest field by far and the only thing read
 * out of it, the `Merge-After:` numbers and the closing keywords, is already
 * here — and so is the per-context map, whose verdicts {@link PayloadChecks}
 * summarises. Both of those grow with the number of pull requests.
 */
export const PayloadEntrySchema = t.record({
  number: t.number(),
  title: t.string(),
  author: t.string(),
  url: t.string(),
  isDraft: t.boolean(),
  labels: t.array(PayloadLabelSchema),
  /** Whether auto-merge is armed, which the `merge-queued` label is not. */
  autoMerge: t.boolean(),
  headRef: t.string(),
  baseRef: t.string(),
  updatedAt: t.string(),
  /** `null` when the comparison could not be read. */
  comparison: t.union([t.nullType, PayloadComparisonSchema]),
  linkedIssues: t.array(PayloadLinkedIssueSchema),
  /** Every number the body declared, open or not. */
  mergeAfter: t.array(t.number()),
  /** The subset of it still open, and so still constraining. */
  blockedBy: t.array(t.number()),
  checks: PayloadChecksSchema,
});

export type PayloadEntry = t.TypeOf<typeof PayloadEntrySchema>;

/**
 * One pull request that has already landed.
 *
 * A separate shape rather than a {@link PayloadEntry} with the fields blanked
 * out: nothing that is true of an open pull request — a merge order, a
 * verdict, a distance from its base — is true of one that has merged, and a
 * type that admitted both would be a type whose every field has to be
 * checked before it is read.
 */
export const PayloadMergedSchema = t.record({
  number: t.number(),
  title: t.string(),
  author: t.string(),
  url: t.string(),
  headRef: t.string(),
  baseRef: t.string(),
  mergedAt: t.string(),
  mergedAtEpochMs: t.number(),
  labels: t.array(PayloadLabelSchema),
  /**
   * The issues the body declared with a closing keyword. GitHub's own list
   * is GraphQL-only and is read for the open pull requests; a merged one is
   * history, and its body is what is left to read it from.
   */
  linkedIssues: t.array(PayloadLinkedIssueSchema),
});

export type PayloadMerged = t.TypeOf<typeof PayloadMergedSchema>;

/**
 * Excess properties are accepted, which is `t.record`'s default and the right
 * one here: a newer report may carry a field this app has no use for yet, and
 * refusing the whole payload over it would take the page down to add
 * something nothing was reading.
 */
export const PrReportPayloadSchema = t.record({
  version: t.number(),
  repo: t.record({ owner: t.string(), name: t.string() }),
  /** ISO 8601, for a person reading the file. */
  generatedAt: t.string(),
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
  generatedAtEpochMs: t.number(),
  /** Whether the report ran with a token, which decides how much it knew. */
  authenticated: t.boolean(),
  /** The contexts `repo-settings/rulesets/main.json` requires. */
  required: t.array(t.string()),
  summary: PayloadSummarySchema,
  /** Every open pull request, lowest number first. */
  entries: t.array(PayloadEntrySchema),
  /** The merge order as a forest. Pull requests on a cycle are not in it. */
  roots: t.array(PayloadTreeNodeSchema),
  cycles: t.array(t.array(t.number())),
  /** Merged within `mergedWithinDays`, newest first. */
  merged: t.array(PayloadMergedSchema),
  /** How far back the list above goes, so a page can say so. */
  mergedWithinDays: t.number(),
});

export type PrReportPayload = t.TypeOf<typeof PrReportPayloadSchema>;
