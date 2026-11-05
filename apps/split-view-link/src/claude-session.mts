/**
 * The Claude Code sessions a pull request names, on the `Claude-Session:`
 * trailers `CLAUDE.md` asks a session to put in its description.
 */

/**
 * A Claude Code session's address, or `undefined` for anything else — which is
 * what is checked of a link before a pane is pointed at it.
 */
export const claudeSessionUrlOf = (address: string): string | undefined =>
  claudeSessionUrlPattern.test(address) ? address : undefined;

/**
 * Every `Claude-Session: [<title>](<url>)`, or `Claude-Session: <url>`, line of
 * `text`: at the start of a line, in any case, and only with the URL of a
 * Claude Code session, so a trailer is not a way to put an arbitrary page in
 * front of whoever opens it. In the order written, once per URL: a pull request
 * continued in a second session names both.
 *
 * Code blocks are the caller's to leave out, because what they look like
 * depends on where the text comes from: a description's Markdown, or what is
 * read off GitHub's rendering of it.
 */
export const claudeSessionTrailersOf = (
  text: string,
): readonly ClaudeSession[] => {
  // `Array.from` rather than the iterator's own `flatMap`: the extension runs
  // this in Chrome from 116, and iterator helpers came in 122.
  const sessions = Array.from(text.matchAll(trailerLinePattern), (line) =>
    sessionOf((line.groups?.['value'] ?? '').trim()),
  ).filter((session) => session !== undefined);

  // Each URL's first index: the later of two equal keys wins in a `Map`.
  const firstIndexOf = new Map(
    sessions.map(({ url }, index) => [url, index] as const).toReversed(),
  );

  return sessions.filter(({ url }, index) => firstIndexOf.get(url) === index);
};

export type ClaudeSession = Readonly<{
  /** The session's title as it read when the pull request was opened. */
  title: string;
  url: string;
}>;

const claudeSessionUrlPattern =
  /^https:\/\/claude\.ai\/code\/session_[0-9A-Za-z]+$/u;

const trailerLinePattern =
  /^[^\S\n]*claude-session[^\S\n]*:(?<value>[^\n]*)$/gimu;

/** `[<title>](<url>)` */
const linkedPattern = /^\[(?<title>.*)\]\((?<url>[^()\s]*)\)$/u;

/** A trailer's value, linked or bare, as a session. */
const sessionOf = (value: string): ClaudeSession | undefined => {
  const linked = linkedPattern.exec(value)?.groups;

  if (linked !== undefined) {
    const linkedUrl = claudeSessionUrlOf(linked['url'] ?? '');

    return linkedUrl === undefined
      ? undefined
      : { title: (linked['title'] ?? '').trim(), url: linkedUrl };
  }

  const bareUrl = claudeSessionUrlOf(value);

  return bareUrl === undefined ? undefined : { title: '', url: bareUrl };
};
