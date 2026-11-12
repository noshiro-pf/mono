import {
  issueTierOf,
  parseMergeAfter,
  type IssueClaim,
  type IssueDecision,
  type IssueStartState,
  type IssueTier,
  type Label,
  type ReferenceStatus,
  type Snapshot,
} from 'pr-report-core-v2';
import { claudeSessionUrlOf } from 'split-view-link';
import { Arr, Result } from 'ts-data-forge';
import { instantMsOf } from '../format.mjs';

/** One open issue as the list and the DAG draw it (spec §11). */
export type IssueRow = Readonly<{
  number: number;
  title: string;
  url: string;
  author: string;
  updatedAtMs: number;
  commentCount: number;
  labels: readonly Label[];
  /** `none` for no tier label, or several. */
  tier: Tier;
  start: IssueStartState;
  /** What it waits for, each with how it stands and its title when read. */
  waits: readonly Readonly<{
    number: number;
    status: ReferenceStatus;
    title: string | undefined;
  }>[];
  /** Its body has `Merge-After:`, which issues do not read. */
  mergeAfterInBody: boolean;
  claim: IssueClaimView | undefined;
  /** Why its start state may be wrong, if it may. */
  unread: string | undefined;
}>;

export type Tier = IssueTier | 'none';

/**
 * Who claimed the issue with `start-issue`, from the token's account's claim
 * comment, while the claim holds (#3233).
 */
export type IssueClaimView = Readonly<{
  state: 'planned' | 'started';
  by: string;
  /** The claimant's address when it is a Claude Code session's. */
  sessionUrl: string | undefined;
  atMs: number;
  /**
   * A `started` claim older than {@link STALE_CLAIM_MS}: likely a session that
   * stopped, drawn so it stands out.
   */
  stale: boolean;
}>;

/**
 * How old a `started` claim may get before it is drawn as stale: a day, which
 * is also how long a `planned` claim lasts unrenewed. A session still at work
 * on one issue after a day is rare enough to be worth a look.
 */
export const STALE_CLAIM_MS = 24 * 60 * 60_000;

export const issueRowOf = (
  decision: IssueDecision,
  titles: ReadonlyMap<number, string>,
  nowMs: number,
): IssueRow => {
  const { facts } = decision;

  const tier = issueTierOf(facts.labels.map(({ name }) => name));

  return {
    number: facts.number,
    title: facts.title,
    url: facts.url,
    author: facts.author,
    updatedAtMs: instantMsOf(facts.updatedAt),
    commentCount: facts.commentCount,
    labels: facts.labels,
    tier: tier === 'several' ? 'none' : tier,
    start: decision.start,
    waits: decision.named.map(({ number, status }) => ({
      number,
      status,
      title: titles.get(number),
    })),
    mergeAfterInBody: Arr.isNonEmpty(parseMergeAfter(facts.body)),
    claim: claimOf(decision.claim, nowMs),
    unread:
      decision.unread === undefined
        ? undefined
        : `${decision.unread.what}: ${decision.unread.message}`,
  };
};

/** Every issue title the snapshot read, by number, for `after #N` tooltips. */
export const issueTitlesOf = (
  snapshot: Snapshot,
): ReadonlyMap<number, string> =>
  new Map<number, string>([
    ...(Result.isOk(snapshot.otherIssues)
      ? Array.from(
          snapshot.otherIssues.value.values(),
          (i) => [i.number, i.title] as const,
        )
      : []),
    ...(Result.isOk(snapshot.openIssues)
      ? snapshot.openIssues.value.issues.map(
          (i) => [i.number, i.title] as const,
        )
      : []),
  ]);

/**
 * The claim as drawn, from the one the decision counted (`decision.claim`), so
 * that the badge and the start state never disagree on whether a claim holds.
 */
const claimOf = (
  claim: IssueClaim | undefined,
  nowMs: number,
): IssueClaimView | undefined => {
  if (claim === undefined) {
    return undefined;
  }

  const atMs = instantMsOf(claim.at);

  return {
    state: claim.state,
    by: claim.by,
    sessionUrl: claudeSessionUrlOf(claim.by),
    atMs,
    stale: claim.state === 'started' && nowMs - atMs > STALE_CLAIM_MS,
  };
};
