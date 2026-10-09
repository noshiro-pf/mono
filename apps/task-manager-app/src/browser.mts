/**
 * The few things the store takes from the browser, each wrapped so that a
 * failure — storage disabled in a private window, a browser without
 * `matchMedia` — degrades to a default instead of stopping the page.
 */

import {
  createEventEmitter,
  type Observable as SynstateObservable,
} from 'synstate';
import { type SortSpec } from './domain/index.mjs';
import {
  ANIMATION_SETTING_STORAGE_KEY,
  DAG_VIEW_MODE_STORAGE_KEY,
  DIAGRAM_SORT_STORAGE_KEY,
  LIST_SETTINGS_STORAGE_KEY,
  NODE_SIZE_STORAGE_KEY,
  parseAnimationSetting,
  parseDagViewMode,
  parseDiagramSort,
  parseListSettings,
  parseNodeSize,
  serializeAnimationSetting,
  serializeDagViewMode,
  serializeDiagramSort,
  serializeListSettings,
  serializeNodeSize,
  type AnimationSetting,
  type DagViewMode,
  type ListSettings,
  type NodeSize,
} from './view-model/index.mjs';

export const loadListSettings = (): ListSettings =>
  parseListSettings(readStorage(LIST_SETTINGS_STORAGE_KEY));

export const saveListSettings = (settings: ListSettings): void => {
  writeStorage(LIST_SETTINGS_STORAGE_KEY, serializeListSettings(settings));
};

export const loadAnimationSetting = (): AnimationSetting =>
  parseAnimationSetting(readStorage(ANIMATION_SETTING_STORAGE_KEY));

export const saveAnimationSetting = (setting: AnimationSetting): void => {
  writeStorage(
    ANIMATION_SETTING_STORAGE_KEY,
    serializeAnimationSetting(setting),
  );
};

export const loadDagViewMode = (): DagViewMode =>
  parseDagViewMode(readStorage(DAG_VIEW_MODE_STORAGE_KEY));

export const saveDagViewMode = (mode: DagViewMode): void => {
  writeStorage(DAG_VIEW_MODE_STORAGE_KEY, serializeDagViewMode(mode));
};

export const loadNodeSize = (): NodeSize =>
  parseNodeSize(readStorage(NODE_SIZE_STORAGE_KEY));

export const saveNodeSize = (size: NodeSize): void => {
  writeStorage(NODE_SIZE_STORAGE_KEY, serializeNodeSize(size));
};

export const loadDiagramSort = (): readonly SortSpec[] =>
  parseDiagramSort(readStorage(DIAGRAM_SORT_STORAGE_KEY));

export const saveDiagramSort = (sort: readonly SortSpec[]): void => {
  writeStorage(DIAGRAM_SORT_STORAGE_KEY, serializeDiagramSort(sort));
};

/**
 * A DOM event as an observable, listened to for as long as the page is
 * open — which is as long as anything in the store lives.
 */
export const fromEvent = (
  target: Readonly<EventTarget>,
  type: string,
): SynstateObservable<void> => {
  const [event$, emit] = createEventEmitter();

  target.addEventListener(type, emit);

  return event$;
};

/** A media query, as the `MediaDeps` of `createMediaStore`. */
export const mediaQuery = (
  query: string,
): Readonly<{
  matches: () => boolean;
  change: SynstateObservable<void>;
}> => {
  const list = matchMedia(query);

  return {
    matches: () => list.matches,
    change: fromEvent(list, 'change'),
  };
};

/** What is stored under `key`, or nothing if storage cannot be read. */
const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not kept between visits, which is all a preference loses.
  }
};
