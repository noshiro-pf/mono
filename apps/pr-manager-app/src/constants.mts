/**
 * Which repository this app reads.
 *
 * Where in it the reports are kept is `pr-report-payload`'s to say, because
 * both the writers and this reader have to agree about that and neither of
 * them owns the other.
 */

export type ReportSource = Readonly<{ owner: string; repo: string }>;

export const REPORT_SOURCE: ReportSource = {
  owner: 'noshiro-pf',
  repo: 'mono',
} as const;

/** The repository the report is about. */
export const repositoryUrl = (source: ReportSource): string =>
  `https://github.com/${source.owner}/${source.repo}` as const;

/**
 * How often the page goes and looks again while it is on screen, which is a
 * different number depending on whether the reader has given it a token.
 *
 * **Without one, two minutes, and the number is set by the rate limit rather
 * than by taste.** An anonymous caller is charged for a `304` as well as for
 * a `200` — measured against this repository, `x-ratelimit-remaining`
 * falling 59, 58, 57 across three conditional requests that all answered
 * 304 — and the budget is 60 an hour for the whole address the browser sits
 * behind, not for the page. One request every two minutes is 30 an hour,
 * which leaves half of it for reloads and for whatever else shares the
 * address.
 *
 * **With one, fifteen seconds**, because both halves of that reverse. The
 * budget becomes 5,000 an hour and belongs to the account rather than to the
 * address, and a `304` is charged nothing at all — measured,
 * `x-ratelimit-remaining` unchanged across four of them. A poll that finds
 * nothing is therefore free, and 240 an hour is inside the budget even if
 * every one of them found something.
 *
 * Little is lost to the slower of the two. A report is rewritten by a
 * workflow that takes about a minute to run (median 58s, measured over its
 * last twenty runs), so neither interval is what decides how old the page
 * is.
 */
export const pollIntervalMs = (token: string | undefined): number =>
  token === undefined ? ANONYMOUS_POLL_INTERVAL_MS : SIGNED_IN_POLL_INTERVAL_MS;

export const ANONYMOUS_POLL_INTERVAL_MS = 120_000;

export const SIGNED_IN_POLL_INTERVAL_MS = 15_000;

/**
 * How often "3 hours ago" is recomputed. Not tied to the poll: the report can
 * go an hour without changing and the sentence about its age still has to
 * keep up, or a tab left open reads as fresh forever.
 */
export const CLOCK_TICK_MS = 30_000;

/**
 * How long **Refresh** stays shut after it is pressed.
 *
 * The button is the one way a reader can spend the budget faster than the
 * poll does, and the anonymous budget is 60 an hour for the whole address:
 * a reader who presses it thirty times in a minute takes the page down for
 * everyone behind that address for the rest of the hour, including
 * themselves. So without a token the wait is the poll interval — pressing it
 * can bring a read forward, not add one.
 *
 * With a token the same press costs one of 5,000, and a read that answers
 * `304` costs nothing at all, so the wait is only long enough to stop a
 * double-click becoming two requests.
 *
 * Held in the callback as well as on the `disabled` attribute. `disabled` is
 * a rendering, and a rendering is a claim about the past: the guard that
 * decides whether a request goes out has to be the one in the handler.
 */
export const refreshCooldownMs = (token: string | undefined): number =>
  token === undefined
    ? ANONYMOUS_REFRESH_COOLDOWN_MS
    : SIGNED_IN_REFRESH_COOLDOWN_MS;

export const ANONYMOUS_REFRESH_COOLDOWN_MS = 120_000;

export const SIGNED_IN_REFRESH_COOLDOWN_MS = 5_000;
