import { Fragment } from 'preact';
import { memoNamed } from 'preact-utils';
import type { ClaudeSession } from '../claude-session.mjs';
import { ExternalLink } from './external-link.js';

type Props = Readonly<{ sessions: readonly ClaudeSession[] }>;

/**
 * The Claude Code sessions the pull request was written in, by title, from
 * the `Claude-Session:` trailers in its body. A trailer that gave the URL
 * alone is shown as the URL.
 */
export const ClaudeSessions = memoNamed<Props>(
  'ClaudeSessions',
  ({ sessions }) => (
    <span className={'claude-sessions'}>
      {'Claude Code '}
      {sessions.map((session, index) => (
        <Fragment key={session.url}>
          {index === 0 ? '' : ', '}
          <ExternalLink href={session.url}>
            {session.title === '' ? session.url : session.title}
          </ExternalLink>
        </Fragment>
      ))}
    </span>
  ),
);
