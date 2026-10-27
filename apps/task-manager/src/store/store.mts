/**
 * The page's state, made once with the browser as its surroundings.
 *
 * Components bind the stores' observables to the DOM and call the stores'
 * actions; none of them holds the app's state. A derivation only one view
 * reads is made in that view's component, so that it exists only while the
 * view is shown. What each store does,
 * and the tests of it, are in the modules this puts together — this file is
 * only which real thing each of them is handed.
 */

import { combine, map, skipIfNoChange } from 'synstate';
import {
  fromEvent,
  loadSetting,
  mediaQuery,
  readLocationSearch,
  replaceLocationSearch,
  saveSetting,
} from '../browser.mjs';
import {
  defaultDirection,
  filterNodes,
  hiddenNodeIds,
  layOutGraph,
  layoutWithElk,
  PLACEMENT_ANIMATION_MS,
  sameNodeIds,
} from '../dag/index.mjs';
import { nodeRefOf, type GraphNodeId } from '../domain/index.mjs';
import type { Backend } from '../repository/index.mjs';
import {
  animationSettingStorage,
  dagShowDoneStorage,
  dagViewModeStorage,
  diagramSortStorage,
  isArrangeable,
  listSettingsStorage,
  nodeSizeStorage,
  parseDagFilterQuery,
  parseViewQuery,
} from '../view-model/index.mjs';
import { createAnimationSettingStore } from './animation-setting-store.mjs';
import { createBulkDeleteStore } from './bulk-delete-store.mjs';
import { createBulkEditStore } from './bulk-edit-store.mjs';
import { createClockStore } from './clock-store.mjs';
import { createDagFilterStore } from './dag-filter-store.mjs';
import { createDagLayoutStore } from './dag-layout-store.mjs';
import { createDagSelectionStore } from './dag-selection-store.mjs';
import { createDagShowDoneStore } from './dag-show-done-store.mjs';
import { createDagViewModeStore } from './dag-view-mode-store.mjs';
import { createDataStore } from './data-store.mjs';
import { createDiagramSortStore } from './diagram-sort-store.mjs';
import { createEditorStore } from './editor-store.mjs';
import { createGroupEditorStore } from './group-editor-store.mjs';
import { createListSettingsStore } from './list-settings-store.mjs';
import { createMediaStore } from './media-store.mjs';
import { createNodeSizeStore } from './node-size-store.mjs';
import { createSessionStore } from './session-store.mjs';
import { createUiStore } from './ui-store.mjs';
import { createViewQuerySync } from './view-query-sync.mjs';

/**
 * Below this width the list is cards, and the DAG runs top to bottom until
 * somebody chooses otherwise.
 */
export const NARROW_QUERY = '(max-width: 599px)';

export const sessionStore = createSessionStore();

/**
 * What the URL asked to show when the page loaded: the screen, and the
 * graph's mode, which wins over the one kept on this device.
 */
const initialViewQuery = parseViewQuery(readLocationSearch());

export const uiStore = createUiStore({ initialView: initialViewQuery.view });

export const dataStore = createDataStore({
  session: sessionStore.session,
  now: () => Date.now(),
  reportError: (message, error) => {
    if (error !== undefined) {
      console.error(error);
    }

    uiStore.showNotice(message);
  },
});

export const clockStore = createClockStore({
  state: dataStore.state,
  now: () => Date.now(),
  maxDelayMs: 60_000,
  setTimer: (callback, delayMs) => setTimeout(callback, delayMs),
  clearTimer: (handle) => {
    clearTimeout(handle);
  },
  wake: fromEvent(document, 'visibilitychange'),
});

export const editorStore = createEditorStore({
  state: dataStore.state,
  now: () => Date.now(),
  newId: () => crypto.randomUUID(),
  timeZone: undefined,
  putTask: dataStore.putTask,
  putMilestone: dataStore.putMilestone,
  deleteNode: (ref) => {
    dataStore.deleteNodes([ref]);
  },
});

export const groupEditorStore = createGroupEditorStore({
  groups: dataStore.groups,
  now: () => Date.now(),
  newId: () => crypto.randomUUID(),
  putGroup: dataStore.putGroup,
  deleteGroup: dataStore.deleteGroup,
});

export const listSettingsStore = createListSettingsStore({
  initial: loadSetting(listSettingsStorage),
  save: saveSetting(listSettingsStorage),
});

export const narrowStore = createMediaStore(mediaQuery(NARROW_QUERY));

export const darkStore = createMediaStore(
  mediaQuery('(prefers-color-scheme: dark)'),
);

export const reducedMotionStore = createMediaStore(
  mediaQuery('(prefers-reduced-motion: reduce)'),
);

export const animationSettingStore = createAnimationSettingStore({
  initial: loadSetting(animationSettingStorage),
  save: saveSetting(animationSettingStorage),
});

export const dagViewModeStore = createDagViewModeStore({
  initial: initialViewQuery.mode ?? loadSetting(dagViewModeStorage),
  save: saveSetting(dagViewModeStorage),
});

export const nodeSizeStore = createNodeSizeStore({
  initial: loadSetting(nodeSizeStorage),
  save: saveSetting(nodeSizeStorage),
});

export const diagramSortStore = createDiagramSortStore({
  initial: loadSetting(diagramSortStorage),
  save: saveSetting(diagramSortStorage),
});

export const dagShowDoneStore = createDagShowDoneStore({
  initial: loadSetting(dagShowDoneStorage),
  save: saveSetting(dagShowDoneStorage),
});

export const dagFilterStore = createDagFilterStore({
  initial: parseDagFilterQuery(readLocationSearch()),
});

/**
 * What the graph screen leaves out (`dag/hidden-nodes.mts`) and what its
 * filter leaves of the rest (`dag/node-filter.mts`).
 */
const dagFilteredNodes = combine([
  dataStore.state,
  dataStore.groups,
  clockStore.now,
  dagShowDoneStore.showDone,
  dagFilterStore.filter,
]).pipe(
  map(([state, groups, now, showDone, filter]) =>
    filterNodes(state, groups, filter, hiddenNodeIds(state, now, showDone)),
  ),
);

/** The nodes the graph screen draws in no mode. */
export const dagHiddenNodes = dagFilteredNodes
  .pipe(map(({ hidden }) => hidden))
  .pipe(skipIfNoChange(sameNodeIds));

/** The nodes drawn faint, outside the filter but joined to what is in it. */
export const dagOutsideNodes = dagFilteredNodes
  .pipe(map(({ outside }) => outside))
  .pipe(skipIfNoChange(sameNodeIds));

export const dagLayoutStore = createDagLayoutStore({
  state: dataStore.state,
  stored: dataStore.dagLayout,
  defaultDirection: narrowStore.matches.pipe(map(defaultDirection)),
  active: uiStore.view.pipe(map((view) => view === 'dag')),
  layout: async (input) => layOutGraph(input, layoutWithElk),
  save: dataStore.putDagLayout,
  nudgeDelayMs: 600,
  setTimer: (callback, delayMs) => setTimeout(callback, delayMs),
  clearTimer: (handle) => {
    clearTimeout(handle);
  },
  reducedMotion: reducedMotionStore.matches,
  animationSetting: animationSettingStore.setting,
  animationMs: PLACEMENT_ANIMATION_MS,
  now: () => performance.now(),
  // Not `requestAnimationFrame` itself, which would be called on this
  // object rather than on `window`, and throw.
  requestFrame: (callback) =>
    requestAnimationFrame(() => {
      callback();
    }),
  cancelFrame: (handle) => {
    cancelAnimationFrame(handle);
  },
  viewMode: dagViewModeStore.mode,
  diagramSort: diagramSortStore.sort,
  stateTime: clockStore.now,
  nodeSize: nodeSizeStore.size,
  hidden: dagHiddenNodes,
  groups: dataStore.groups,
  setGroup: (id, groupId) => {
    dataStore.setNodeGroup(nodeRefOf(id), groupId);
  },
});

const viewQuerySync = createViewQuerySync({
  view: uiStore.view,
  mode: dagViewModeStore.mode,
  filter: dagFilterStore.filter,
  read: readLocationSearch,
  write: replaceLocationSearch,
});

export const dagSelectionStore = createDagSelectionStore({
  state: dataStore.state,
  // The nodes outside the filter are there to be seen, not edited with it.
  hidden: combine([dagHiddenNodes, dagOutsideNodes]).pipe(
    // `union`'s type argument is written out: under the strict standard library
    // it is otherwise inferred as `string` from a set of a literal union,
    // through the widened parameter of `ReadonlySet#has`.
    map(([hidden, outside]): ReadonlySet<GraphNodeId> =>
      hidden.union<GraphNodeId>(outside),
    ),
  ),
  active: combine([uiStore.view, dagViewModeStore.mode]).pipe(
    map(([view, mode]) => view === 'dag' && isArrangeable(mode)),
  ),
});

export const bulkEditStore = createBulkEditStore({
  editNodes: dataStore.editNodes,
});

export const bulkDeleteStore = createBulkDeleteStore({
  selected: dagSelectionStore.selected,
  deleteNodes: dataStore.deleteNodes,
});

/**
 * Starts the timers and the listeners. Called once, from `main.tsx`, before
 * the first render, so the page is drawn dark from the start on a dark
 * system.
 */
export const startStore = (): (() => void) => {
  const stops = [
    dataStore.start(),
    clockStore.start(),
    listSettingsStore.start(),
    narrowStore.start(),
    darkStore.start(),
    reducedMotionStore.start(),
    animationSettingStore.start(),
    dagViewModeStore.start(),
    nodeSizeStore.start(),
    diagramSortStore.start(),
    dagShowDoneStore.start(),
    dagLayoutStore.start(),
    dagSelectionStore.start(),
    viewQuerySync.start(),
  ] as const;

  // Blueprint's dark styles hang off `.bp6-dark` on an ancestor.
  const darkSubscription = darkStore.matches.subscribe((dark) => {
    document.documentElement.classList.toggle('bp6-dark', dark);
  });

  return () => {
    darkSubscription.unsubscribe();

    for (const stopOne of stops) {
      stopOne();
    }
  };
};

/** Hands the session to `backend`, once `main.tsx` has loaded it. */
export const attachBackend = (backend: Backend): (() => void) =>
  sessionStore.attach(backend);
