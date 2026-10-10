/**
 * How the graph screen draws the graph — 「DAG」, every node where it was
 * put; 「アーク」, the tasks alone in one column with their dependencies as
 * arcs beside it (`dag/arc-layout.mts`); or 「タイル」, the tasks alone in
 * rows across the screen with no edges, scrolled down
 * (`dag/tile-layout.mts`) — and how the choice is kept in `localStorage`
 * between visits, on this device only.
 *
 * A mode is added by adding it to {@link dagViewModes} and
 * {@link dagViewModeLabels}: the switch in the toolbar lists them all, and
 * {@link isArrangeable} says whether the reader's own arrangement applies to
 * it. Kept as every setting is (`persisted-setting.mts`): anything stored
 * that is not a mode gives 「DAG」.
 */

import * as t from 'ts-fortress';
import { type ReadonlyRecord } from 'ts-type-forge';
import { persistedSetting } from './persisted-setting.mjs';

export const dagViewModes = ['dag', 'arc', 'tile'] as const;

export const DagViewModeCodec = t.enumType(dagViewModes, {
  defaultValue: 'dag',
});

export type DagViewMode = t.TypeOf<typeof DagViewModeCodec>;

export const DEFAULT_DAG_VIEW_MODE: DagViewMode = DagViewModeCodec.defaultValue;

export const dagViewModeStorage = persistedSetting(DagViewModeCodec, {
  key: 'task-manager-app:dag-view-mode',
});

export const dagViewModeLabels = {
  dag: 'DAG',
  arc: 'アーク',
  tile: 'タイル',
} as const satisfies ReadonlyRecord<DagViewMode, string>;

/**
 * Whether the nodes are drawn where the reader put them — so that they can
 * be dragged, moved with the arrow keys and arranged automatically, and the
 * direction applies. In any other mode their places follow from the data.
 */
export const isArrangeable = (mode: DagViewMode): boolean => mode === 'dag';
