/**
 * Why `unblock-prs` set a pull request aside, written where GitHub keeps it.
 *
 * The script decides on someone's machine and says so on standard output,
 * which is where nobody can see it afterwards. So each time it sets a pull
 * request aside it also writes a commit status on that pull request's head:
 * context {@link SET_ASIDE_CONTEXT}, state `failure`, and a description this
 * module writes and reads back. The Pull Requests Manager page reads it from
 * the check results it already fetches, and anyone else sees it on the pull
 * request.
 *
 * **Its own record rather than GitHub's `mergeable`.** That answers whether
 * *merging* the branch conflicts, from a cached background computation; the
 * script *rebases*, and the two disagree for a chained pull request whose
 * parent was squash-merged and on a cache that has not caught up. Only the
 * script knows what the rebase said.
 *
 * **It lasts exactly as long as the state it was reached in**, without
 * anyone taking it off. A push to the branch moves the head, and a status
 * belongs to one commit, so the new head has none. A moved base is the other
 * half, and {@link setAsideStillApplies} is where that is decided, for the
 * script and the page alike.
 *
 * It is not a required context, so it holds no merge: a pull request set
 * aside can still be merged by hand.
 */

/** The context the status is written under. */
export const SET_ASIDE_CONTEXT = 'unblock-prs';

/** What GitHub accepts in a commit status's description. */
export const SET_ASIDE_DESCRIPTION_LIMIT = 140;

export type SetAside = Readonly<{
  /** One of `unblock-prs`'s skip reasons, such as `rebase-failed`. */
  reason: string;
  /** The tip of the base when it was set aside. */
  baseSha: string;
  /** One sentence, cut to fit. */
  detail: string;
}>;

/**
 * `rebase-failed at <40 hex>: <detail>`, on one line and within
 * {@link SET_ASIDE_DESCRIPTION_LIMIT}. The whole SHA rather than a short
 * one, because what reads it back compares it with the base's tip.
 */
export const describeSetAside = ({
  reason,
  baseSha,
  detail,
}: SetAside): string => {
  const head = `${reason} at ${baseSha}: ` as const;

  const room = SET_ASIDE_DESCRIPTION_LIMIT - head.length;

  const oneLine = detail.replaceAll(/\s+/gu, ' ').trim();

  return oneLine.length <= room
    ? `${head}${oneLine}`
    : `${head}${oneLine.slice(0, Math.max(0, room - 1))}…`;
};

/** The record, or `undefined` for a description this module did not write. */
export const parseSetAside = (description: string): SetAside | undefined => {
  const groups = SET_ASIDE_DESCRIPTION.exec(description)?.groups;

  const reason = groups?.['reason'];

  const baseSha = groups?.['baseSha'];

  return reason === undefined || baseSha === undefined
    ? undefined
    : { reason, baseSha, detail: groups?.['detail'] ?? '' };
};

/**
 * Whether a pull request set aside against `setAside.baseSha` is still set
 * aside now that the base is at `baseTip`. The head is not asked about here:
 * a status belongs to one commit, and a record on a head that moved is no
 * longer the head's.
 *
 * Every reason clears when the base moves, because a moved base is the one
 * thing the script knows how to act on — a rebase that conflicted may not
 * any more — except `checks-failed`: rebasing it would put the same failing
 * matrix through again, and the push that carries the fix is what clears it.
 */
export const setAsideStillApplies = (
  setAside: Readonly<{ reason: string; baseSha: string }>,
  baseTip: string,
): boolean =>
  setAside.reason === 'checks-failed' || setAside.baseSha === baseTip;

const SET_ASIDE_DESCRIPTION =
  /^(?<reason>[a-z][a-z-]*) at (?<baseSha>[0-9a-f]{40}): (?<detail>.*)$/u;
