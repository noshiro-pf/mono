import type { ClaudeSession } from 'split-view-link';
import { map } from 'synstate';
import { constant, For, If, type Bindable, type JSX } from 'synstate-dom';
import { ExternalLink } from './external-link.js';
import { separator } from './linked-issues.js';

type Props = Readonly<{ sessions: Bindable<readonly ClaudeSession[]> }>;

/**
 * The Claude Code sessions the pull request was written in, by title, from the
 * `Claude-Session:` trailers in its body. A trailer that gave the URL alone is
 * shown as the URL, cut short with an ellipsis where the card is too narrow for
 * it.
 */
export const ClaudeSessions = ({ sessions }: Props): JSX.Element => (
  <span class={constant('claude-sessions')}>
    {constant('Claude Code ')}
    <For items={sessions} key={(session) => session.url}>
      {(session$, index$) => {
        const url = session$.pipe(map((session) => session.url));

        return (
          <>
            {index$.pipe(map(separator))}
            <ExternalLink href={url}>
              <If
                cond={session$.pipe(map((session) => session.title === ''))}
                else={<>{session$.pipe(map((session) => session.title))}</>}
                then={<span class={constant('claude-session-url')}>{url}</span>}
              />
            </ExternalLink>
          </>
        );
      }}
    </For>
  </span>
);
