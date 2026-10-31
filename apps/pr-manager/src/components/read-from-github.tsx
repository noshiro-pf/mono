import { constant, view, type JSX } from 'synstate-dom';
import { formatLocalTime } from '../format.mjs';
import { reader } from '../store/index.mjs';
import { Age } from './age.js';
import { FetchingIndicator } from './fetching-indicator.js';

/**
 * When the report on screen was read: how long ago, and exactly when in the
 * reader's own time zone. Every read changes it, and only the nodes bound to
 * the time of reading are rewritten for it. While the next read is out, it says
 * so (`FetchingIndicator`).
 */

/** In the folded header: a few words beside the title, with the exact time in the tooltip. */
export const ReadFromGitHubFolded = (): JSX.Element => (
  <span
    class={constant('toolbar-read')}
    title={view(reader.readAt, formatLocalTime)}
  >
    {constant('Read ')}
    <Age epochMs={reader.readAt} />
    <FetchingIndicator compact={true} />
  </span>
);

/** Otherwise, a line of its own under the header. */
export const ReadFromGitHub = (): JSX.Element => (
  <p class={constant('page-subtitle read-from-github')}>
    {constant('Read from GitHub ')}
    <Age epochMs={reader.readAt} />
    {constant(' · ')}
    {view(reader.readAt, formatLocalTime)}
    <FetchingIndicator compact={false} />
  </p>
);
