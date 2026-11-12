import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import {
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
 * The counts both views lead with (spec §11.1): `open`, the tiers as one joined
 * group, `hold` and `close` beside them, and `in progress`, each a switch with
 * an `only`.
 */
export const IssueTiles = ({
  counts,
  settings,
  update,
}: Props): JSX.Element => (
  <div class={constant('tiles')}>
    <OpenTile open={counts.pipe(map(({ open }) => open))} />
    <div class={constant('tile-group')}>
      {GROUPED.map((tier) => (
        <TierTile
          counts={counts}
          settings={settings}
          tier={tier}
          update={update}
        />
      ))}
    </div>
    {APART.map((tier) => (
      <TierTile
        counts={counts}
        settings={settings}
        tier={tier}
        update={update}
      />
    ))}
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
  </div>
);

const GROUPED = ['S', 'A', 'B', 'C', 'D', 'none'] as const;

const APART = ['hold', 'close'] as const;
