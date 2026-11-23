import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import {
  toggleAuthorOnlyHidden,
  toggleAuthorOnlyOnly,
  toggleInProgressHidden,
  toggleInProgressOnly,
  type IssuesSettings,
  type issueTileCounts,
} from '../../../domain/index.mjs';
import type { IssuesStore } from '../../../store/index.mjs';
import { OpenTile, TileSwitch } from '../../common/index.mjs';
import { TierTile } from './tier-tile.js';

type Counts = ReturnType<typeof issueTileCounts>;

type Props = Readonly<{
  counts: InitializedObservable<Counts>;
  settings: InitializedObservable<IssuesSettings>;
  update: IssuesStore['update'];
}>;

/**
 * The counts both views lead with (spec §11.1), in two rows: `open` with
 * `in progress`, `author only` (the issues labelled `author-only`, which no
 * session is handed), `hold` and `close`; then the tiers as one joined group.
 * Each but `open` is a switch with an `only`.
 */
export const IssueTiles = ({
  counts,
  settings,
  update,
}: Props): JSX.Element => (
  <div class={constant('issue-tiles filter-bar')}>
    <div class={constant('tiles')}>
      <OpenTile open={counts.pipe(map(({ open }) => open))} />
      <TileSwitch
        count={counts.pipe(map(({ inProgress }) => inProgress))}
        label={'in progress'}
        only={settings.pipe(map(({ onlyInProgress }) => onlyInProgress))}
        subject={'the issues in progress'}
        onOnly={() => {
          update(toggleInProgressOnly);
        }}
        onToggle={() => {
          update(toggleInProgressHidden);
        }}
      />
      <TileSwitch
        count={counts.pipe(map(({ authorOnly }) => authorOnly))}
        label={'author only'}
        only={settings.pipe(map(({ onlyAuthorOnly }) => onlyAuthorOnly))}
        subject={'the issues only the author can do'}
        onOnly={() => {
          update(toggleAuthorOnlyOnly);
        }}
        onToggle={() => {
          update(toggleAuthorOnlyHidden);
        }}
      />
      {APART.map((tier) => (
        <TierTile
          counts={counts}
          settings={settings}
          tier={tier}
          update={update}
        />
      ))}
    </div>
    <div
      aria-label={constant('Tiers')}
      class={constant('tile-group')}
      role={constant('group')}
    >
      {GROUPED.map((tier) => (
        <TierTile
          counts={counts}
          settings={settings}
          tier={tier}
          update={update}
        />
      ))}
    </div>
  </div>
);

const GROUPED = ['S', 'A', 'B', 'C', 'D', 'none'] as const;

const APART = ['hold', 'close'] as const;
