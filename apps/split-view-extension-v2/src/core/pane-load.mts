import { originOf, unframeableOf, type Unframeable } from './address.mjs';
import { addressOf, type Pane } from './workspace/index.mjs';

/**
 * Whether a pane's page loaded, as a pure state machine (spec P10–P15).
 *
 * The component feeds it what happens — the frame's `load`, a report, a timer
 * running out — and draws what `paneLoadView` derives. Timers carry the load
 * they were started for, so one left over from an earlier load is ignored here
 * rather than cancelled there.
 */
export type PaneLoad = Readonly<{
  /** One load of one address in one element; see `loadKeyOf`. */
  loadKey: string;
  /**
   * Counts loads, never repeating as a `loadKey` does when a pane goes back to
   * an address: which load a no-answer timer belongs to.
   */
  loadSerial: number;
  /**
   * `load` events seen in this pane, counted across loads so that none repeats:
   * which one a grace timer belongs to.
   */
  frameLoads: number;
  /** A report came since the last `load` event. */
  reportedSinceFrameLoad: boolean;
  /** A report came during this load at all. */
  answered: boolean;
  /** The last `load` went 800ms without a report. */
  silent: boolean;
  /** Ten seconds passed with no report for this load. */
  waitedOut: boolean;
  /** Where a link was taking the frame, until a document answers from there. */
  leavingFor: string | undefined;
  /** The fallback was sent away for this document. */
  dismissed: boolean;
  /**
   * Automatic clears since a document last answered: a budget, since a site
   * that registers its worker on every visit would otherwise reload for ever.
   */
  automaticClears: number;
  /** An automatic clear was made for this load already. */
  clearedThisLoad: boolean;
  /** The hidden helper frame clearing service workers, while there is one. */
  helper: Readonly<{ url: string; serial: number }> | undefined;
  helperSerial: number;
  /** How many registrations the last clear removed. */
  removedWorkers: number | undefined;
}>;

export type PaneLoadEvent =
  // The pane's address, element or sandbox changed: a new load.
  Readonly<
    | { type: 'load-key'; loadKey: string }
    | { type: 'frame-load' } // The grace after the `frameLoads`-th `load` event ran out.
    | { type: 'grace-elapsed'; frameLoads: number }
    | { type: 'report' }
    | { type: 'leaving'; url: string }
    | { type: 'waited-out'; loadSerial: number }
    | { type: 'dismiss' } // Clear the site's workers, from the button or by itself.
    | { type: 'clear-workers'; origin: string; automatic: boolean }
    | { type: 'workers-removed'; count: number }
    | { type: 'helper-timeout'; serial: number }
  >;

export const graceMs = 800;

export const noAnswerMs = 10_000;

export const maxAutomaticClears = 2;

/** The element a pane's frame is, as its key: a new one is a new load. */
export const frameKeyOf = (pane: Pane): string =>
  `${pane.live.reloadToken.toString()}:${pane.sandboxed ? 'sandboxed' : 'open'}` as const;

export const loadKeyOf = (pane: Pane): string =>
  `${pane.url}#${frameKeyOf(pane)}` as const;

export const initialPaneLoad = (loadKey: string): PaneLoad =>
  ({
    loadKey,
    loadSerial: 0,
    frameLoads: 0,
    reportedSinceFrameLoad: false,
    answered: false,
    silent: false,
    waitedOut: false,
    leavingFor: undefined,
    dismissed: false,
    automaticClears: 0,
    clearedThisLoad: false,
    helper: undefined,
    helperSerial: 0,
    removedWorkers: undefined,
  }) as const;

export const paneLoadReducer = (
  state: PaneLoad,
  event: PaneLoadEvent,
): PaneLoad => {
  switch (event.type) {
    case 'load-key':
      return event.loadKey === state.loadKey
        ? state
        : {
            ...initialPaneLoad(event.loadKey),
            loadSerial: state.loadSerial + 1,
            frameLoads: state.frameLoads,
            // Survive the reloads an automatic clear causes, or it would loop.
            automaticClears: state.automaticClears,
            helperSerial: state.helperSerial,
            removedWorkers: state.removedWorkers,
          };

    case 'frame-load':
      return {
        ...state,
        frameLoads: state.frameLoads + 1,
        reportedSinceFrameLoad: false,
        // A document of its own gets a fallback of its own, after a grace of
        // its own: the last one's silence is not this one's.
        silent: false,
        dismissed: false,
      };

    case 'grace-elapsed':
      return event.frameLoads !== state.frameLoads ||
        state.reportedSinceFrameLoad
        ? state
        : { ...state, silent: true };

    case 'report':
      return state.reportedSinceFrameLoad &&
        state.answered &&
        !state.silent &&
        state.leavingFor === undefined &&
        state.automaticClears === 0
        ? state
        : {
            ...state,
            reportedSinceFrameLoad: true,
            answered: true,
            silent: false,
            leavingFor: undefined,
            automaticClears: 0,
          };

    case 'leaving':
      // Kept until the frame next reports, even for a navigation that never
      // commits (a 204, a cancelled `beforeunload`): the old document hears
      // nothing of its end, as Chrome fires no `navigateerror` for it. Retry and
      // "open in a new tab" then go where the link pointed, as was clicked.
      return { ...state, leavingFor: event.url };

    case 'waited-out':
      return event.loadSerial !== state.loadSerial || state.answered
        ? state
        : { ...state, waitedOut: true };

    case 'dismiss':
      return { ...state, dismissed: true };

    case 'clear-workers': {
      const serial = state.helperSerial + 1;

      return {
        ...state,
        helper: { url: `${event.origin}/`, serial },
        helperSerial: serial,
        removedWorkers: undefined,
        ...(event.automatic
          ? {
              automaticClears: state.automaticClears + 1,
              clearedThisLoad: true,
            }
          : {}),
      };
    }

    case 'workers-removed':
      return { ...state, helper: undefined, removedWorkers: event.count };

    case 'helper-timeout':
      return state.helper?.serial === event.serial
        ? { ...state, helper: undefined }
        : state;
  }
};

/** What a pane shows and offers, from its load and its address. */
export type PaneLoadView = Readonly<{
  /** Where the pane is, as the address bar shows it. */
  address: string;
  /** Known from the address alone: nothing frames these. */
  refusal: Unframeable | undefined;
  /** The pane is not showing the page it was asked for. */
  blocked: boolean;
  /** Blocked by the site rather than by the browser: worth clearing workers. */
  blockedBySite: boolean;
  /** The frame reported for this document: a reload can go through it. */
  frameAnswers: boolean;
  siteOrigin: string | undefined;
  alwaysClear: boolean;
  /** Retrying means something: what failed is the address the pane was given. */
  canRetry: boolean;
  showFallback: boolean;
  /** Start a clear now, without being asked. */
  shouldClearAutomatically: boolean;
  /** Where "retry" and "open in a new tab" go. */
  target: string;
}>;

export const paneLoadView = (
  state: PaneLoad,
  pane: Pane,
  alwaysClearOrigins: readonly string[],
): PaneLoadView => {
  const address = addressOf(pane);

  const refusal = unframeableOf(address);

  const blocked =
    pane.url !== '' &&
    (refusal !== undefined ||
      state.silent ||
      (!state.answered && state.waitedOut));

  const blockedBySite = blocked && refusal === undefined;

  const siteOrigin = originOf(state.leavingFor ?? address);

  const alwaysClear =
    siteOrigin !== undefined && alwaysClearOrigins.includes(siteOrigin);

  const clearBudgetLeft =
    state.automaticClears < maxAutomaticClears && !state.clearedThisLoad;

  const shouldClearAutomatically =
    alwaysClear &&
    blockedBySite &&
    state.helper === undefined &&
    clearBudgetLeft;

  // While a clear is running or about to, the pane has not finished failing.
  const clearing =
    alwaysClear &&
    blockedBySite &&
    (state.helper !== undefined || clearBudgetLeft);

  return {
    address,
    refusal,
    blocked,
    blockedBySite,
    frameAnswers: state.reportedSinceFrameLoad && !state.silent,
    siteOrigin,
    alwaysClear,
    canRetry: blockedBySite && !state.answered,
    showFallback: blocked && !state.dismissed && !clearing,
    shouldClearAutomatically,
    target: blocked ? (state.leavingFor ?? address) : address,
  };
};
