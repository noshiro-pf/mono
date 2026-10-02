/**
 * The page's state, made once with the browser as its surroundings.
 *
 * The components read it through the signals below and call its actions;
 * none of them holds state of its own. What each part does, and the tests of
 * it, are in the modules this puts together — this file is only which real
 * thing each of them is handed.
 */

import {
  counter,
  createEventEmitter,
  type Observable as SynstateObservable,
} from 'synstate';
import { toSignal } from 'synstate-preact-signals';
import { REPORT_SOURCE } from '../constants.mjs';
import { layoutFromLocation, saveLayout } from '../layout.mjs';
import { loadReport } from '../load-report.mjs';
import {
  applyTheme,
  saveTheme,
  systemColorScheme,
  systemColorSchemeQuery,
  themeFromLocation,
} from '../theme.mjs';
import { browserStores } from '../token.mjs';
import { createLayoutStore } from './layout-store.mjs';
import { createReader } from './reader.mjs';
import { createThemeStore } from './theme-store.mjs';
import { createTokenStore } from './token-store.mjs';

export const tokenStore = createTokenStore(browserStores());

export const reader = createReader({
  token: tokenStore.token,
  load: (token, nowMs) => loadReport(REPORT_SOURCE, { token, nowMs }),
  now: () => Date.now(),
  counter: (ms) => counter(ms),
  isVisible: () => document.visibilityState === 'visible',
  visibilityChange: fromEvent(document, 'visibilitychange'),
});

export const themeStore = createThemeStore({
  initial: themeFromLocation(),
  system: {
    get: systemColorScheme,
    change: fromEvent(systemColorSchemeQuery(), 'change'),
  },
  apply: applyTheme,
  save: saveTheme,
});

export const layoutStore = createLayoutStore({
  initial: layoutFromLocation(),
  save: saveLayout,
  saveDelayMs: 300,
});

/**
 * Everything a component reads, as Preact signals, and the only way a
 * component reads the stores.
 *
 * The stores stay synstate, which is what their operators and their tests
 * are written in; this is where their values cross into the view. Read
 * `.value` in a render and Preact renders that component again when it
 * changes, as a hook would. Hand the signal itself to JSX as a child or a
 * DOM attribute instead and Preact rewrites that one node without rendering
 * anything, which is what the ages do (`components/age.tsx`).
 *
 * Nothing is made of them on the way: what a component needs, the store
 * derives, and emits only when it changed (`reader.mts`).
 */
export const readerSignals = {
  loadStatus: toSignal(reader.loadStatus),
  readAt: toSignal(reader.readAt),
  summary: toSignal(reader.summary),
  entries: toSignal(reader.entries),
  byNumber: toSignal(reader.byNumber),
  scaleMax: toSignal(reader.scaleMax),
  roots: toSignal(reader.roots),
  cycles: toSignal(reader.cycles),
  merged: toSignal(reader.merged),
  issues: toSignal(reader.issues),
  rateLimit: toSignal(reader.rateLimit),
  nowMs: toSignal(reader.nowMs),
} as const;

export const tokenSignals = {
  token: toSignal(tokenStore.token),
  saveError: toSignal(tokenStore.saveError),
  typed: toSignal(tokenStore.typed),
  remember: toSignal(tokenStore.remember),
} as const;

export const themeSignals = {
  theme: toSignal(themeStore.theme),
  system: toSignal(themeStore.system),
} as const;

export const layoutSignals = {
  layout: toSignal(layoutStore.layout),
  moving: toSignal(layoutStore.moving),
  settingsOpen: toSignal(layoutStore.settingsOpen),
} as const;

/**
 * Starts the timers and the listeners. Called once, from `main.tsx`, before
 * the first render: the theme is written to `<html>` as it starts, so a page
 * opened with `?theme=` never draws a frame of the other one.
 */
export const startStore = (): (() => void) => {
  const stopToken = tokenStore.start();

  const stopTheme = themeStore.start();

  const stopReader = reader.start();

  const stopLayout = layoutStore.start();

  return () => {
    stopToken();

    stopTheme();

    stopReader();

    stopLayout();
  };
};

/**
 * A DOM event as an observable. Listened to for as long as the page is open,
 * which is as long as anything here lives.
 */
function fromEvent(
  target: Readonly<EventTarget>,
  type: string,
): SynstateObservable<void> {
  const [event$, emit] = createEventEmitter();

  target.addEventListener(type, emit);

  return event$;
}
