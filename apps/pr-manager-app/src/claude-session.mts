/**
 * The Claude Code sessions a pull request was written in, read from the
 * `Claude-Session:` trailers `CLAUDE.md` asks a session to put in its body.
 */

import { outsideCodeFences } from 'pr-report-core';

export type ClaudeSession = Readonly<{
  /** The session's title as it read when the pull request was opened. */
  title: string;
  url: string;
}>;

/**
 * `Claude-Session: [<title>](https://claude.ai/code/session_…)`, or the URL
 * alone, anywhere in the body and outside a fenced code block — the same
 * line `Merge-After:` draws, for the same reason: a document showing what a
 * trailer looks like must not become one.
 *
 * Only a URL of a Claude Code session is taken. The first of them is opened
 * in a pane of the split view, so a trailer is not a way to put an arbitrary
 * page in front of whoever opens it.
 *
 * In the order written, once per URL: a pull request continued in a second
 * session names both.
 */
export const parseClaudeSessions = (body: string): readonly ClaudeSession[] => {
  const sessions = outsideCodeFences(body)
    .matchAll(TRAILER_LINE)
    .flatMap((line) => {
      const session = sessionOf((line.groups?.['value'] ?? '').trim());

      return session === undefined ? [] : [session];
    })
    .toArray();

  return sessions.filter(
    (session, index) =>
      sessions.findIndex(({ url }) => url === session.url) === index,
  );
};

const TRAILER_LINE = /^[^\S\n]*claude-session[^\S\n]*:(?<value>[^\n]*)$/gimu;

/** `[<title>](<url>)`, where the URL is a Claude Code session's and nothing more. */
const LINKED =
  /^\[(?<title>.*)\]\((?<url>https:\/\/claude\.ai\/code\/session_[0-9A-Za-z]+)\)$/u;

const BARE = /^(?<url>https:\/\/claude\.ai\/code\/session_[0-9A-Za-z]+)$/u;

const sessionOf = (value: string): ClaudeSession | undefined => {
  const linked = LINKED.exec(value)?.groups;

  if (linked !== undefined) {
    return {
      title: (linked['title'] ?? '').trim(),
      url: linked['url'] ?? '',
    };
  }

  const bare = BARE.exec(value)?.groups;

  return bare === undefined ? undefined : { title: '', url: bare['url'] ?? '' };
};
