import type { RouterBrowser } from '../browser.mjs';
import { isRestoredLoad } from './restored-load.mjs';
import { withHash } from './with-hash.mjs';

/**
 * The real window, read when a router is created, so that importing the package
 * or defining routes does not need one. The location is `globalThis.location`;
 * the history is `window.history`, which only a window has.
 */
export const globalBrowser = (): RouterBrowser =>
  ({
    location: globalThis.location,
    history: window.history,
    setHash: (hash) => {
      // The current URL with another fragment: a fragment navigation, as
      // `location.hash = hash` is. Built from `href`, since a relative `#x`
      // would resolve against a `<base href>`.
      globalThis.location.assign(withHash(globalThis.location.href, hash).href);
    },
    addEventListener: (type, listener) => {
      globalThis.addEventListener(type, listener);
    },
    removeEventListener: (type, listener) => {
      globalThis.removeEventListener(type, listener);
    },
    afterRender: (callback) => {
      // A DOM without frames (jsdom) has none to wait for.
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          callback();
        });
      } else {
        setTimeout(callback, 0);
      }
    },
    scrollToTop: () => {
      globalThis.scrollTo(0, 0);
    },
    scrollToFragment: (id) => {
      const element = document.querySelector(`#${CSS.escape(id)}`);

      element?.scrollIntoView();

      return element !== null;
    },
    // The browser's own restore, or the app's when it set
    // `history.scrollRestoration` to 'manual': either way not the router's.
    restoresScroll: () =>
      isRestoredLoad(Reflect.get(globalThis, 'performance')),
  }) as const;
