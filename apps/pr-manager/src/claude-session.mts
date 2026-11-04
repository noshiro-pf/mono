/**
 * The Claude Code sessions a pull request was written in, read from the
 * `Claude-Session:` trailers `CLAUDE.md` asks a session to put in its body.
 */

import { outsideCodeFences } from 'pr-report-core';
import { claudeSessionTrailersOf, type ClaudeSession } from 'split-view-link';

/**
 * The trailers `claudeSessionTrailersOf` reads, outside a fenced code block —
 * the same line `Merge-After:` draws, for the same reason: a document showing
 * what a trailer looks like must not become one.
 *
 * The first of them is opened in a pane of the split view.
 */
export const parseClaudeSessions = (body: string): readonly ClaudeSession[] =>
  claudeSessionTrailersOf(outsideCodeFences(body));
