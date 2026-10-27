import { constant, view, type JSX } from 'synstate-dom';
import { formatLocalTime } from '../format.mjs';
import { reader } from '../store/index.mjs';
import { Age } from './age.js';

/**
 * When the report on screen was read: how long ago, and exactly when in the
 * reader's own time zone. Every read changes it, and only the nodes bound to
 * the time of reading are rewritten for it.
 */

/** In the folded header: a few words beside the title, with the exact time in the tooltip. */
export const ReadFromGitHubFolded = (): JSX.Element => (
  <span
    class={constant('toolbar-read')}
    title={view(reader.readAt, formatLocalTime)}
  >
    {constant('Read ')}
    <Age epochMs={reader.readAt} />
  </span>
);

/** Otherwise, a line of its own under the header. */
export const ReadFromGitHub = (): JSX.Element => (
  <p class={constant('page-subtitle read-from-github')}>
    {constant('Read from GitHub ')}
    <Age epochMs={reader.readAt} />
    {constant(' · ')}
    {view(reader.readAt, formatLocalTime)}
  </p>
);
