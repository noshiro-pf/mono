import { map, type InitializedObservable } from 'synstate';
import type { JSX } from 'synstate-dom';
import {
  TIER_TITLES,
  toggleTierHidden,
  toggleTierOnly,
  type IssuesSettings,
  type issueTileCounts,
  type Tier,
} from '../../../domain/index.mjs';
import type { IssuesStore } from '../../../store/index.mjs';
import { TileSwitch } from '../../common/index.mjs';

type Props = Readonly<{
  tier: Tier;
  counts: InitializedObservable<ReturnType<typeof issueTileCounts>>;
  settings: InitializedObservable<IssuesSettings>;
  update: IssuesStore['update'];
}>;

export const TierTile = ({
  tier,
  counts,
  settings,
  update,
}: Props): JSX.Element => (
  <TileSwitch
    count={counts.pipe(map(({ tiers }) => tiers[tier]))}
    description={TIER_TITLES[tier]}
    label={tier}
    only={settings.pipe(map(({ onlyPriority }) => onlyPriority.includes(tier)))}
    subject={tier === 'none' ? 'the issues with no tier' : `the ${tier} issues`}
    tone={tier === 'S' ? 'critical' : undefined}
    onOnly={() => {
      update((prev) => toggleTierOnly(prev, tier));
    }}
    onToggle={() => {
      update((prev) => toggleTierHidden(prev, tier));
    }}
  />
);
