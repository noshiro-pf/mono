import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { splitViewUrl, type SplitViewSource } from '../split-view.mjs';
import { ExternalLink } from './external-link.js';

type Props = Readonly<{ entry: SplitViewSource }>;

/**
 * Opens the pull request in `split-view-extension` — the diff beside the
 * conversation, and beside those the issue it closes and the Claude Code
 * session it was written in, when it names them.
 *
 * Drawn whether or not the extension is installed: the page's
 * `Content-Security-Policy` lets it connect to `api.github.com` alone, so it
 * cannot ask. Without the extension the new tab is Chrome's "blocked" page,
 * which the title says in advance.
 */
export const SplitViewLink = React.memo<Props>(({ entry }) => (
  <ExternalLink
    href={splitViewUrl(entry)}
    title={
      Arr.isNonEmpty(entry.linkedIssues) || Arr.isNonEmpty(entry.claudeSessions)
        ? 'open the diff, the conversation, and the issue or the session beside them (needs split-view-extension)'
        : 'open the diff and the conversation side by side (needs split-view-extension)'
    }
    variant={'split-view'}
  >
    <span aria-hidden={'true'}>{'⧉ '}</span>
    {'split view'}
  </ExternalLink>
));

SplitViewLink.displayName = 'SplitViewLink';
