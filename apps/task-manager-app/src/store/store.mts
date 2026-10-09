/**
 * The page's state, made once with the browser as its surroundings, and the
 * Preact signals the components read it through.
 *
 * Components read a signal's `.value` (which subscribes them) and call the
 * stores' actions; none of them holds the app's state. What each store does,
 * and the tests of it, are in the modules this puts together — this file is
 * only which real thing each of them is handed.
 */

import { computed } from '@preact/signals';
import { map } from 'synstate';
import { toSignal } from 'synstate-preact-signals';
import {
  fromEvent,
  loadAnimationSetting,
  loadDagViewMode,
  loadDiagramSort,
  loadListSettings,
  loadNodeSize,
  mediaQuery,
  saveAnimationSetting,
  saveDagViewMode,
  saveDiagramSort,
  saveListSettings,
  saveNodeSize,
} from '../browser.mjs';
import {
  arcEdges,
  buildNodeViews,
  defaultDirection,
  fromElkGraph,
  layoutWithElk,
  PLACEMENT_ANIMATION_MS,
  toElkGraph,
} from '../dag/index.mjs';
import { type Backend } from '../repository/index.mjs';
import { buildMilestoneRows, buildTaskRows } from '../view-model/index.mjs';
import { createAnimationSettingStore } from './animation-setting-store.mjs';
import { createClockStore } from './clock-store.mjs';
import { createDagLayoutStore } from './dag-layout-store.mjs';
import { createDagViewModeStore } from './dag-view-mode-store.mjs';
import { createDataStore } from './data-store.mjs';
import { createDiagramSortStore } from './diagram-sort-store.mjs';
import { createEditorStore } from './editor-store.mjs';
import { createListSettingsStore } from './list-settings-store.mjs';
import { createMediaStore } from './media-store.mjs';
import { createNodeSizeStore } from './node-size-store.mjs';
import { createSessionStore } from './session-store.mjs';
import { createUiStore } from './ui-store.mjs';

/**
 * Below this width the list is cards, and the DAG runs top to bottom until
 * somebody chooses otherwise.
 */
export const NARROW_QUERY = '(max-width: 599px)';

export const sessionStore = createSessionStore();

export const uiStore = createUiStore({ initialView: 'list' });

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
  deleteNode: dataStore.deleteNode,
});

export const listSettingsStore = createListSettingsStore({
  initial: loadListSettings(),
  save: saveListSettings,
});

export const narrowStore = createMediaStore(mediaQuery(NARROW_QUERY));

export const darkStore = createMediaStore(
  mediaQuery('(prefers-color-scheme: dark)'),
);

export const reducedMotionStore = createMediaStore(
  mediaQuery('(prefers-reduced-motion: reduce)'),
);

export const animationSettingStore = createAnimationSettingStore({
  initial: loadAnimationSetting(),
  save: saveAnimationSetting,
});

export const dagViewModeStore = createDagViewModeStore({
  initial: loadDagViewMode(),
  save: saveDagViewMode,
});

export const nodeSizeStore = createNodeSizeStore({
  initial: loadNodeSize(),
  save: saveNodeSize,
});

export const diagramSortStore = createDiagramSortStore({
  initial: loadDiagramSort(),
  save: saveDiagramSort,
});

export const dagLayoutStore = createDagLayoutStore({
  state: dataStore.state,
  stored: dataStore.dagLayout,
  defaultDirection: narrowStore.matches.pipe(map(defaultDirection)),
  active: uiStore.view.pipe(map((view) => view === 'dag')),
  layout: async (input) =>
    fromElkGraph(input, await layoutWithElk(toElkGraph(input))),
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
});

export const sessionSignal = toSignal(sessionStore.session);

export const domainSignal = toSignal(dataStore.state);

export const dataStatusSignal = toSignal(dataStore.status);

export const nowSignal = toSignal(clockStore.now);

export const viewSignal = toSignal(uiStore.view);

export const noticeSignal = toSignal(uiStore.notice);

export const settingsPanelSignal = toSignal(uiStore.settingsPanel);

export const editorSignal = toSignal(editorStore.editor);

export const listSettingsSignal = toSignal(listSettingsStore.settings);

export const narrowSignal = toSignal(narrowStore.matches);

export const animationSettingSignal = toSignal(animationSettingStore.setting);

export const reducedMotionSignal = toSignal(reducedMotionStore.matches);

export const dagViewModeSignal = toSignal(dagViewModeStore.mode);

export const nodeSizeSignal = toSignal(nodeSizeStore.size);

export const diagramSortSignal = toSignal(diagramSortStore.sort);

export const dagAutoLayoutSignal = toSignal(dagLayoutStore.autoLayout);

export const dagArrangementSignal = toSignal(dagLayoutStore.arrangement);

export const dagFitRequestsSignal = toSignal(dagLayoutStore.fitRequests);

export const dagAnimatedPositionsSignal = toSignal(
  dagLayoutStore.animatedPositions,
);

export const dagAnimatedOpacitiesSignal = toSignal(
  dagLayoutStore.animatedOpacities,
);

export const dagAnimationProgressSignal = toSignal(
  dagLayoutStore.animationProgress,
);

export const arcNodesSignal = toSignal(dagLayoutStore.arcNodes);

export const tileNodesSignal = toSignal(dagLayoutStore.tileNodes);

export const taskRowsSignal = computed(() =>
  buildTaskRows(domainSignal.value, nowSignal.value, listSettingsSignal.value),
);

export const milestoneRowsSignal = computed(() =>
  buildMilestoneRows(domainSignal.value, nowSignal.value),
);

export const nodeViewsSignal = computed(() =>
  buildNodeViews(domainSignal.value, nowSignal.value),
);

export const arcEdgesSignal = computed(() => arcEdges(domainSignal.value));

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
    dagLayoutStore.start(),
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
