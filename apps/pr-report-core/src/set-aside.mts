/**
 * Why `unblock-prs` set a pull request aside, written where GitHub keeps it.
 *
 * The script decides on someone's machine and says so on standard output,
 * which is where nobody can see it afterwards. So each time it sets a pull
 * request aside it also writes a comment on that pull request — one per pull
 * request, edited in place from then on — whose first line is a hidden
 * record this module writes and reads back, and whose last line is a task
 * box a person ticks to have the script try again. What lies between is
 * prose for whoever reads it, and nothing reads it back. The Pull Requests
 * Manager page and the script itself read the record; anyone else reads the
 * prose on the pull request.
 *
 * **A comment rather than a commit status**, which is what it used to be. A
 * status has no state that means "for information": `failure` left a red ✗ on
 * a context nothing requires, until the next push, with 140 characters to say
 * why, and nobody could take it off or ask for another try. **Rather than the
 * body**, because the author, a session and `open-pr` write the body too, the
 * REST API has no conditional update to keep an edit made in between, and the
 * version pull request's body is rewritten on every push to the base.
 *
 * **Only the comments the reader's own account wrote count.** The repository
 * is public, so anyone can post a comment that starts with the marker; the
 * script and the page both ask GitHub for `viewerDidAuthor` and read nothing
 * else — the account that runs `unblock-prs` is the one that looks at the
 * page. A task box in someone else's comment can be ticked only by those who
 * can write to the repository, so the retry is not open to outsiders either.
 *
 * **Its own record rather than GitHub's `mergeable`.** That answers whether
 * *merging* the branch conflicts, from a cached background computation; the
 * script *rebases*, and the two disagree for a chained pull request whose
 * parent was squash-merged and on a cache that has not caught up. Only the
 * script knows what the rebase said.
 *
 * **It lasts exactly as long as the state it was reached in.** The record
 * names the head and the base it was reached at; a push moves the head, and
 * {@link setAsideApplies} is where a moved head and a moved base are judged,
 * for the script and the page alike. Once it no longer applies, or a person
 * asked for a retry, the script rewrites the comment to one resolved line
 * rather than deleting it, so that the timeline keeps what happened.
 *
 * It holds no merge: a pull request set aside can still be merged by hand.
 */

/**
 * How many of a pull request's most recent comments are searched for the
 * record. The comment is edited in place, so it stays where it was first
 * posted; a pull request with more comments than this after it is one whose
 * record is not found, and the script then posts a second.
 */
export const SET_ASIDE_COMMENT_SCAN = 100;

export type SetAside = Readonly<{
  /** One of `unblock-prs`'s skip reasons, such as `rebase-failed`. */
  reason: string;
  /** The head it was set aside at. */
  headSha: string;
  /** The tip of the base when it was set aside. */
  baseSha: string;
}>;

/**
 * What one of the script's comments says: a pull request still set aside,
 * and whether a person has ticked the retry box on it, or one that was and
 * is not any more.
 */
export type SetAsideComment = Readonly<
  | { kind: 'resolved' }
  | { kind: 'standing'; setAside: SetAside; retry: boolean }
>;

/**
 * The record line, `prose`, and an empty retry box on the last line. The
 * whole SHAs rather than short ones, because what reads them back compares
 * them with the head and the base.
 */
export const writeSetAsideComment = (
  setAside: SetAside,
  prose: string,
): string =>
  [
    `${MARKER} reason=${setAside.reason} head=${setAside.headSha} base=${setAside.baseSha} -->`,
    '',
    prose.trim(),
    '',
    `- [ ] ${RETRY_LABEL} tick this box and the next survey tries this pull request again.`,
  ].join('\n');

/** The record line saying it is over, and `prose`, one line saying why. */
export const writeResolvedComment = (prose: string): string =>
  [`${MARKER} resolved -->`, '', prose.trim()].join('\n');

/** What the comment says, or `undefined` for a comment this module did not write. */
export const parseSetAsideComment = (
  body: string,
): SetAsideComment | undefined => {
  const lines = body.trim().split(/\r?\n/u);

  const [first] = lines;

  if (first === undefined) {
    return undefined;
  }

  if (first.trim() === `${MARKER} resolved -->`) {
    return { kind: 'resolved' };
  }

  const groups = STANDING_LINE.exec(first.trim())?.groups;

  const reason = groups?.['reason'];

  const headSha = groups?.['headSha'];

  const baseSha = groups?.['baseSha'];

  if (reason === undefined || headSha === undefined || baseSha === undefined) {
    return undefined;
  }

  // The last line only: a task box anywhere else, in the prose or in what a
  // command printed, is not the one this module wrote.
  const retryMark = RETRY_LINE.exec(lines.at(-1)?.trim() ?? '')?.groups?.[
    'mark'
  ];

  return {
    kind: 'standing',
    setAside: { reason, headSha, baseSha },
    retry: retryMark !== undefined && retryMark !== ' ',
  };
};

/**
 * Whether a pull request set aside at `setAside` is still set aside now that
 * its head is at `headTip` and its base at `baseTip`. A push to the branch
 * clears every reason.
 */
export const setAsideApplies = (
  setAside: SetAside,
  headTip: string,
  baseTip: string,
): boolean =>
  setAside.headSha === headTip && setAsideStillApplies(setAside, baseTip);

/**
 * The base half of {@link setAsideApplies}, for a caller that has already
 * judged the head.
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

/** The first line starts with this, so the comment is found by it. */
const MARKER = '<!-- unblock-prs:set-aside';

const RETRY_LABEL = 'Retry:';

const STANDING_LINE =
  /^<!-- unblock-prs:set-aside reason=(?<reason>[a-z][a-z-]*) head=(?<headSha>[0-9a-f]{40}) base=(?<baseSha>[0-9a-f]{40}) -->$/u;

const RETRY_LINE = /^[-*] \[(?<mark>[ xX])\] Retry:/u;
