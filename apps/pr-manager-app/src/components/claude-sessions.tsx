import { constant, For, If, view, type Bindable, type JSX } from 'synstate-dom';
import type { ClaudeSession } from '../claude-session.mjs';
import { ExternalLink } from './external-link.js';
import { separator } from './linked-issues.js';

type Props = Readonly<{ sessions: Bindable<readonly ClaudeSession[]> }>;

/**
 * The Claude Code sessions the pull request was written in, by title, from
 * the `Claude-Session:` trailers in its body. A trailer that gave the URL
 * alone is shown as the URL, cut short with an ellipsis where the card is
 * too narrow for it.
 */
export const ClaudeSessions = ({ sessions }: Props): JSX.Element => (
  <span class={constant('claude-sessions')}>
    {constant('Claude Code ')}
    <For items={sessions} key={(session) => session.url}>
      {(session$, index$) => {
        const url = view(session$, (session) => session.url);

        return (
          <>
            {view(index$, separator)}
            <ExternalLink href={url}>
              <If
                cond={view(session$, (session) => session.title === '')}
                else={<>{view(session$, (session) => session.title)}</>}
                then={<span class={constant('claude-session-url')}>{url}</span>}
              />
            </ExternalLink>
          </>
        );
      }}
    </For>
  </span>
);
