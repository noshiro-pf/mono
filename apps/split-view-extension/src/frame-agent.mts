import { Arr } from 'ts-data-forge';
import {
  asPageToFrameMessage,
  paneFrameNamePrefix,
  splitViewMessageTag,
  workspaceShortcutCodeOf,
  zoomStepFromWheel,
  type FrameCommand,
  type FrameToPageMessage,
  type IncomingMessageEvent,
  type ShortcutKeyEvent,
  type ZoomWheelEvent,
} from './shared/index.mjs';

/**
 * The content script that runs inside every pane.
 *
 * It exists because the page cannot see into a cross-origin frame: it cannot
 * read where the user has navigated to, cannot read the title, and cannot call
 * `history.back()`. A script running *in* the frame can do all three, and can
 * talk to the page over `postMessage`.
 *
 * It is declared for `<all_urls>` and every frame, so it is injected into
 * ordinary browsing too. The first thing it does is decide whether it is inside
 * a split view and return if it is not, which is why that check is a couple of
 * property reads and no message traffic.
 *
 * A pane whose page blocks content scripts (a `chrome://` URL, the Web Store,
 * an error page) never reports. The page treats silence as "no agent" and says
 * so in the pane's toolbar rather than assuming the pane is broken.
 */
const reportIntervalMs = 1000;

// See the note in `header-rules.mts`: `window.navigator` / `globalThis.navigator`
// / a bare `navigator` cannot all satisfy the lint rules at once.
const { navigator: browserNavigator } = globalThis;

// `history` cannot be reached as `window.history` (the lint rules want
// `globalThis`) nor as `globalThis.history` (they then want it bare) nor bare
// (it is a restricted global). Destructuring it once names it something that is
// none of those.
const { history: browserHistory } = globalThis;

const main = (): void => {
  if (!isSplitViewFrame()) {
    return;
  }

  // The pane this frame belongs to, and the origin to answer on. Both are
  // learned from the page's `assign` message rather than assumed, so a frame
  // that was never assigned stays silent.
  let mut_paneId: number | undefined = undefined;

  let mut_replyOrigin: string | undefined = undefined;

  // What was last reported. A report that would say the same thing again is
  // dropped, so that the polling below costs the page nothing while nothing is
  // happening.
  let mut_lastSignature: string | undefined = undefined;

  const report = (): void => {
    if (mut_paneId === undefined || mut_replyOrigin === undefined) {
      return;
    }

    const message: FrameToPageMessage = {
      tag: splitViewMessageTag,
      kind: 'state',
      paneId: mut_paneId,
      url: document.location.href,
      title: document.title,
      historyLength: browserHistory.length,
    } as const;

    const signature = [
      message.url,
      message.title,
      String(message.historyLength),
    ].join(' ');

    if (signature === mut_lastSignature) {
      return;
    }

    mut_lastSignature = signature;

    window.parent.postMessage(message, mut_replyOrigin);
  };

  addEventListener('message', (messageEvent: IncomingMessageEvent) => {
    if (messageEvent.source !== window.parent) {
      return;
    }

    if (!messageEvent.origin.startsWith('chrome-extension://')) {
      return;
    }

    const message = asPageToFrameMessage(messageEvent.data);

    if (message === undefined) {
      return;
    }

    if (message.kind === 'unregister-service-workers') {
      unregisterServiceWorkers(message.paneId, messageEvent.origin).catch(
        () => undefined,
      );

      return;
    }

    if (message.kind === 'assign') {
      mut_paneId = message.paneId;

      mut_replyOrigin = messageEvent.origin;

      mut_lastSignature = undefined;

      report();

      return;
    }

    runCommand(message.command);
  });

  /**
   * Forwards the split view's own shortcuts to the page.
   *
   * `Alt+1..9` switches split views, and the focus is inside a pane most of the
   * time — where the page's own `keydown` listener never sees the key, because
   * a key event does not cross a frame boundary. A frame that has not been
   * assigned a pane stays silent, as it does for everything else.
   */
  addEventListener('keydown', (keyboardEvent: ShortcutKeyEvent) => {
    const code = workspaceShortcutCodeOf(keyboardEvent);

    if (
      code === undefined ||
      mut_paneId === undefined ||
      mut_replyOrigin === undefined
    ) {
      return;
    }

    keyboardEvent.preventDefault();

    const message: FrameToPageMessage = {
      tag: splitViewMessageTag,
      kind: 'shortcut',
      paneId: mut_paneId,
      code,
    } as const;

    window.parent.postMessage(message, mut_replyOrigin);
  });

  /**
   * Forwards `Ctrl`+wheel — and a trackpad pinch, which Chrome reports as one
   * — so that it zooms this pane rather than the whole browser tab.
   *
   * Not passive, because `preventDefault` is what stops the browser zooming
   * the tab underneath us. The page does the zooming: it scales the `iframe`
   * from outside, which works whether or not this script is running.
   */
  addEventListener(
    'wheel',
    (wheelEvent: ZoomWheelEvent) => {
      const step = zoomStepFromWheel(wheelEvent);

      if (
        step === undefined ||
        mut_paneId === undefined ||
        mut_replyOrigin === undefined
      ) {
        return;
      }

      wheelEvent.preventDefault();

      const message: FrameToPageMessage = {
        tag: splitViewMessageTag,
        kind: 'zoom',
        paneId: mut_paneId,
        step,
      } as const;

      window.parent.postMessage(message, mut_replyOrigin);
    },
    { passive: false },
  );

  // `document_start` is before all of these, so none of them has fired yet.
  addEventListener('DOMContentLoaded', report);

  addEventListener('load', report);

  addEventListener('hashchange', report);

  addEventListener('popstate', report);

  // A single-page application changes its URL through `history.pushState`,
  // which fires no event outside the page's own world. Polling a string
  // comparison is what covers that without reaching into the page.
  setInterval(report, reportIntervalMs);
};

/**
 * Removes the site's service workers for this context, and says how many went.
 *
 * A service worker that answers a navigation puts the response out of
 * `declarativeNetRequest`'s reach entirely — measured: not even a rule with no
 * conditions at all can strip the framing headers off a response the site's own
 * worker produced. Unregistering it is the only way to get the page back on the
 * network, where the rules work. The site will register it again on its next
 * ordinary visit; this is a way out of a pane that cannot load, not a policy.
 */
const unregisterServiceWorkers = async (
  paneId: number,
  replyOrigin: string,
): Promise<void> => {
  const registrations = await browserNavigator.serviceWorker.getRegistrations();

  const results = await Promise.all(
    registrations.map(async (registration) => registration.unregister()),
  );

  const message: FrameToPageMessage = {
    tag: splitViewMessageTag,
    kind: 'service-workers',
    paneId,
    count: results.filter((removed) => removed).length,
  } as const;

  window.parent.postMessage(message, replyOrigin);
};

const runCommand = (command: FrameCommand): void => {
  if (command === 'back') {
    browserHistory.back();

    return;
  }

  if (command === 'forward') {
    browserHistory.forward();

    return;
  }

  document.location.reload();
};

const isSplitViewFrame = (): boolean => {
  // Empty for a top-level document, so this is also the "am I in a frame at
  // all" test, which is what makes the check cheap on ordinary pages.
  const ancestors = Array.from(document.location.ancestorOrigins);

  if (!Arr.isNonEmpty(ancestors)) {
    return false;
  }

  if (window.name.startsWith(paneFrameNamePrefix)) {
    return true;
  }

  return ancestors.some((ancestor) =>
    ancestor.startsWith('chrome-extension://'),
  );
};

main();
