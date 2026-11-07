import { map } from 'synstate';
import {
  constant,
  deriveBindable,
  inlineMap,
  mapBindable,
  type JSX,
} from 'synstate-dom';
import { reader, tokenStore, type PaneRead } from '../store/index.mjs';
import { BadgeIcon } from './badge-icon.js';

type Props = Readonly<{
  /** What the pane is drawn from. */
  pane: PaneRead;
  /** What it reads, as the end of "Read … again". */
  what: string;
}>;

/**
 * A pane's own Refresh, in its title: reads what that pane is drawn from and
 * nothing else (`reader.refreshPane`), which costs the points of that part
 * alone where the header's Refresh pays for the whole page.
 *
 * Shut while that part is being read, which includes a read of the page that
 * has not got to it yet, and the arrows turn: one more read would pay for the
 * answer on its way. Shut too until the page has shown a report, but for the
 * workflow runs, which are read apart from it.
 */
export const PaneRefresh = ({ pane, what }: Props): JSX.Element => {
  const busy = reader.paneReading.pipe(map((reading) => reading.has(pane)));

  const label = mapBindable(busy, (isBusy) =>
    isBusy ? `Reading ${what}…` : `Read ${what} again`,
  );

  return (
    <button
      aria-label={label}
      class={constant('pane-refresh')}
      data-busy={inlineMap(busy, (isBusy) => (isBusy ? 'true' : 'false'))}
      disabled={deriveBindable(
        [busy, reader.loadStatus, tokenStore.token],
        (isBusy, status, token) =>
          isBusy ||
          token === undefined ||
          // The runs are read apart from the report.
          (pane !== 'runs' && status.type !== 'ready'),
      )}
      title={label}
      type={constant('button')}
      onClick={() => {
        reader.refreshPane(pane);
      }}
    >
      <BadgeIcon path={constant(ARROWS)} />
    </button>
  );
};

/** Two arcs chasing each other round, each with its head. */
const ARROWS =
  'M13.5 6.5A5.5 5.5 0 0 0 3.4 4.4M2.5 2v2.8h2.8M2.5 9.5a5.5 5.5 0 0 0 10.1 2.1M13.5 14v-2.8h-2.8';
