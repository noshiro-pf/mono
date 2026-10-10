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
 * it. Validated on read as the animation setting is
 * (`animation-setting.mts`): anything that is not a mode gives 「DAG」.
 */

import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';

export const dagViewModes = ['dag', 'arc', 'tile'] as const;

export type DagViewMode = (typeof dagViewModes)[number];

export const DAG_VIEW_MODE_STORAGE_KEY = 'task-manager-app:dag-view-mode';

export const DEFAULT_DAG_VIEW_MODE: DagViewMode = 'dag';

export const dagViewModeLabels = {
  dag: 'DAG',
  arc: 'アーク',
  tile: 'タイル',
} as const satisfies ReadonlyRecord<DagViewMode, string>;

/** The stored mode, or 「DAG」 when there is none to read. */
export const parseDagViewMode = (stored: string | null): DagViewMode => {
  if (stored === null) {
    return DEFAULT_DAG_VIEW_MODE;
  }

  const parsed = Result.flatMap(Json.parse(stored), (json) =>
    DagViewModeType.validate(json),
  );

  return Result.isOk(parsed) ? parsed.value : DEFAULT_DAG_VIEW_MODE;
};

export const serializeDagViewMode = (mode: DagViewMode): string =>
  JSON.stringify(mode);

/**
 * Whether the nodes are drawn where the reader put them — so that they can
 * be dragged, moved with the arrow keys and arranged automatically, and the
 * direction applies. In any other mode their places follow from the data.
 */
export const isArrangeable = (mode: DagViewMode): boolean => mode === 'dag';

const DagViewModeType = t.enumType(dagViewModes);
