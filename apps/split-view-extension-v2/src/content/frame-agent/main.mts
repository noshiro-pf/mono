import { Arr } from 'ts-data-forge';
import {
  asNestedKey,
  asPageToFrame,
  frameTag,
  isPaneOfFrameQuery,
  isZoomWheel,
  paneFrameNamePrefix,
  paneIdOfFrameName,
  paneKeyOf,
  unassignedKeyRoute,
  wheelZoomStep,
  type FrameCommand,
  type FrameToPage,
  type NestedKey,
  type PaneKey,
  type WheelZoomStep,
} from '../../core/index.mjs';
import { readResetOrigins, watchStorage } from '../../platform/index.mjs';

/**
 * The content script in every frame (spec A1–A6). The page cannot see into a
 * cross-origin frame — where it is, its title, its history — and this script,
 * inside it, can, and talks to the page over `postMessage`.
 *
 * Declared for every frame of every page, so it first decides, in a couple of
 * property reads and no messages, whether it is in a split view at all.
 */
const main = (): void => {
  if (!isSplitViewFrame()) {
    return;
  }

  // Learned from the page's `assign`, never assumed: a frame never assigned
  // reports nothing and only hands keys up.
  const mut_state: {
    pane: Readonly<{ id: number; origin: string }> | undefined;
    lastReport: string | undefined;
    lastWheelStep: WheelZoomStep | undefined;
    reportTimer: ReturnType<typeof setInterval> | undefined;
  } = {
    pane: undefined,
    lastReport: undefined,
    lastWheelStep: undefined,
    reportTimer: undefined,
  };

  const post = (message: FrameToPage): void => {
    if (mut_state.pane !== undefined) {
      window.parent.postMessage(message, mut_state.pane.origin);
    }
  };

  /** Where the document is, when that differs from the last report (A2). */
  const report = (): void => {
    if (mut_state.pane === undefined) {
      return;
    }

    const signature = [
      document.location.href,
      document.title,
      window.history.length.toString(),
    ].join('\n');

    if (signature === mut_state.lastReport) {
      return;
    }

    mut_state.lastReport = signature;

    post({
      tag: frameTag,
      kind: 'state',
      paneId: mut_state.pane.id,
      url: document.location.href,
      title: document.title,
      historyLength: window.history.length,
    });
  };

  /** One of the keys a pane takes (A3); whether it was taken. */
  const takePaneKey = (key: PaneKey): boolean => {
    if (mut_state.pane !== undefined) {
      if (key.kind === 'reload') {
        runCommand('reload');
      } else {
        post({
          tag: frameTag,
          kind: 'shortcut',
          paneId: mut_state.pane.id,
          code: key.code,
        });
      }

      return true;
    }

    const route = unassignedKeyRoute(
      {
        parentIsSplitPage: parentIsSplitPage(),
        namedAsPane: window.name.startsWith(paneFrameNamePrefix),
      },
      key,
    );

    switch (route) {
      case 'leave':
        return false;

      case 'reload-self':
        runCommand('reload');

        return true;

      case 'hand-up': {
        const handedUp: NestedKey = {
          tag: frameTag,
          kind: 'nested-key',
          key,
        } as const;

        // Any origin: the frame above is the pane's site, and the message says
        // only which key was pressed.
        window.parent.postMessage(handedUp, '*');

        return true;
      }
    }
  };

  // Which pane is this (A5), for "open in a split" in this frame: the one
  // assigned, else the one the frame's name says before a new document is
  // assigned; `null` in a frame nested in a pane's page.
  chrome.runtime.onMessage.addListener(
    (value: unknown, sender, sendResponse: (answer: number | null) => void) => {
      if (sender.id !== chrome.runtime.id || !isPaneOfFrameQuery(value)) {
        return false;
      }

      sendResponse(
        mut_state.pane?.id ??
          (parentIsSplitPage() ? paneIdOfFrameName(window.name) : undefined) ??
          null,
      );

      return false;
    },
  );

  addEventListener('message', (event: IncomingMessage) => {
    if (event.source !== window.parent) {
      const nested = asNestedKey(event.data);

      // Only from the child frame holding the focus, so that a frame the user
      // is not in cannot press a key for them.
      if (nested !== undefined && isFocusedChildFrame(event.source)) {
        takePaneKey(nested.key);
      }

      return;
    }

    if (event.origin !== ownExtensionOrigin()) {
      return;
    }

    const message = asPageToFrame(event.data);

    if (message === undefined) {
      return;
    }

    switch (message.kind) {
      case 'assign':
        mut_state.pane = { id: message.paneId, origin: event.origin };

        mut_state.lastReport = undefined;

        report();

        // `history.pushState` fires nothing this world hears. Polled only once
        // assigned: most frames under the page are a pane page's own.
        mut_state.reportTimer ??= setInterval(report, reportIntervalMs);

        return;

      case 'command':
        runCommand(message.command);

        return;

      case 'unregister-service-workers':
        removeServiceWorkers()
          .then((count) => {
            post({
              tag: frameTag,
              kind: 'service-workers',
              paneId: message.paneId,
              count,
            });
          })
          .catch(() => {
            // No workers to clear (`navigator.serviceWorker` is undefined on a
            // non-secure origin): answered all the same, or the pane waits.
            post({
              tag: frameTag,
              kind: 'service-workers',
              paneId: message.paneId,
              count: 0,
            });
          });
    }
  });

  // On the window, in the bubble phase: a site that took the key keeps it.
  addEventListener('keydown', (event: KeyboardEvent) => {
    const key = paneKeyOf(event);

    if (key !== undefined && takePaneKey(key)) {
      event.preventDefault();
    }
  });

  // Not passive: preventing it is what stops Chrome zooming the tab (A4).
  addEventListener(
    'wheel',
    (event: WheelEvent) => {
      if (!isZoomWheel(event) || mut_state.pane === undefined) {
        return;
      }

      event.preventDefault();

      const { last, step } = wheelZoomStep(mut_state.lastWheelStep, event);

      mut_state.lastWheelStep = last;

      if (step !== undefined) {
        post({ tag: frameTag, kind: 'zoom', paneId: mut_state.pane.id, step });
      }
    },
    { passive: false },
  );

  for (const type of ['DOMContentLoaded', 'load', 'hashchange', 'popstate']) {
    addEventListener(type, report);
  }

  // Where a GET navigation is going, before it goes (spec P13): the document
  // that arrives may be one that cannot report, such as a page the site's
  // worker answered, and the fallback has to offer *that* address.
  window.navigation.addEventListener('navigate', (event) => {
    if (
      mut_state.pane === undefined ||
      event.destination.sameDocument ||
      event.downloadRequest !== null ||
      event.formData !== null
    ) {
      return;
    }

    post({
      tag: frameTag,
      kind: 'leaving',
      paneId: mut_state.pane.id,
      url: event.destination.url,
    });
  });

  // Asked to be assigned as soon as there is a document to report, rather than
  // at the frame's `load`, which a slow subresource can hold back past the
  // page's ten seconds of waiting (spec A2).
  const namedPaneId = parentIsSplitPage()
    ? paneIdOfFrameName(window.name)
    : undefined;

  if (namedPaneId !== undefined) {
    const hello = (): void => {
      window.parent.postMessage(
        {
          tag: frameTag,
          kind: 'hello',
          paneId: namedPaneId,
        } satisfies FrameToPage,
        ownExtensionOrigin(),
      );
    };

    if (document.readyState === 'loading') {
      addEventListener('DOMContentLoaded', hello, { once: true });
    } else {
      hello();
    }
  }

  keepServiceWorkersAway();
};

/** What is read of a `MessageEvent`; anything may send one. */
type IncomingMessage = Readonly<{
  source: unknown;
  origin: string;
  data: unknown;
}>;

const reportIntervalMs = 1000;

/** A site registers its worker when it likes; GitHub, a moment after load. */
const sweepIntervalMs = 1000;

/**
 * Unregisters this origin's service workers and counts them. A worker that
 * answers a navigation puts the response out of every rule's reach, so this is
 * the only way back to a page the rules can frame.
 */
const removeServiceWorkers = async (): Promise<number> => {
  const registrations =
    await globalThis.navigator.serviceWorker.getRegistrations();

  const removed = await Promise.all(
    registrations.map(async (registration) => registration.unregister()),
  );

  return removed.filter(Boolean).length;
};

/**
 * Keeps an always-clear origin's workers away while this document is open (spec
 * P15), watching the list so that turning it on takes effect at once.
 */
const keepServiceWorkersAway = (): void => {
  const { origin } = document.location;

  // An opaque origin is on no list.
  if (origin === 'null') {
    return;
  }

  // Swept on a timer only while the origin is on the list.
  const mut_sweep: { timer: ReturnType<typeof setInterval> | undefined } = {
    timer: undefined,
  };

  const sweep = (): void => {
    removeServiceWorkers().catch(() => undefined);
  };

  const adopt = (origins: readonly string[]): void => {
    if (!origins.includes(origin)) {
      clearInterval(mut_sweep.timer);

      mut_sweep.timer = undefined;

      return;
    }

    sweep();

    mut_sweep.timer ??= setInterval(sweep, sweepIntervalMs);
  };

  readResetOrigins()
    .then(adopt)
    .catch(() => undefined);

  watchStorage({ list: undefined, resetOrigins: adopt });
};

const runCommand = (command: FrameCommand): void => {
  switch (command) {
    case 'back':
      // The tab's joint session history, not this frame's alone: when the
      // newest entry is another frame's, or the page's own `pushState` from a
      // switch, that is what goes back. Nothing a frame can call steps through
      // its own entries only across origins (`navigation.back()` sees the
      // same-origin ones alone), so a pane's Back is the browser's Back.
      window.history.back();

      return;

    case 'forward':
      window.history.forward();

      return;

    case 'reload':
      document.location.reload();
  }
};

/** Through shadow roots, closed ones too, where `activeElement` is the host. */
const deepActiveElement = (element: Element | null): Element | null => {
  const root =
    element instanceof HTMLElement
      ? chrome.dom.openOrClosedShadowRoot(element)
      : null;

  const inner = root?.activeElement ?? null;

  return inner === null ? element : deepActiveElement(inner);
};

const isFocusedChildFrame = (source: unknown): boolean => {
  const focused = deepActiveElement(document.activeElement);

  return (
    (focused instanceof HTMLIFrameElement ||
      focused instanceof HTMLObjectElement) &&
    focused.contentWindow === source
  );
};

const ownExtensionOrigin = (): string =>
  `chrome-extension://${chrome.runtime.id}` as const;

const parentIsSplitPage = (): boolean =>
  document.location.ancestorOrigins[0] === ownExtensionOrigin();

/**
 * In a frame, and either named as a pane or below this extension's page — not
 * another extension's.
 */
const isSplitViewFrame = (): boolean => {
  const ancestors = Array.from(document.location.ancestorOrigins);

  return (
    Arr.isNonEmpty(ancestors) &&
    (window.name.startsWith(paneFrameNamePrefix) ||
      ancestors.includes(ownExtensionOrigin()))
  );
};

main();
