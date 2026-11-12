import { Optional } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { NavigateOptions, Router } from './create-router.mjs';
import type { AnyRoutes } from './route-types.mjs';

/**
 * What {@link handleLinkClick} reads of a click: a DOM `MouseEvent` and a React
 * `MouseEvent` both have it.
 */
export type LinkClickEvent = Readonly<{
  defaultPrevented: boolean;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  /** The `<a>` the handler is on, not the element clicked inside it. */
  currentTarget: Readonly<{
    href: string;
    target: string;
    hasAttribute: (name: string) => boolean;
  }>;
  preventDefault: () => void;
}>;

/** What {@link handleLinkClick} uses of a router. */
export type LinkClickRouter = StrictPick<
  Router<AnyRoutes>,
  'parseHref' | 'push' | 'replace'
>;

/**
 * Routes a click on an `<a>` through the router when the browser would
 * otherwise load a page of this application, and returns whether it did. The
 * one place the rules are, for every binding's `Link`:
 *
 * - Only a primary-button click with no modifier key (a new tab or window, a
 *   download stay the browser's), on an anchor with no `target` other than
 *   `_self` and no `download`.
 * - The anchor is the event's `currentTarget`, so a click on an icon inside the
 *   link counts (#2954).
 * - Only a URL `router.parseHref` accepts: this origin, below the base path, a
 *   page. Anything else is loaded by the browser.
 * - Only a binding's `Href`: a `Link` given an `ExternalHref` does not call
 *   this (`isHref`), so that one is loaded by the browser even to this origin.
 * - A move to a fragment of the current page is routed too: `router.push`
 *   makes it the browser's own fragment navigation, which scrolls, fires
 *   `hashchange` and marks `:target` (#3033), and points a scroll the router
 *   still has pending at the fragment rather than letting it run after. With
 *   `replace` it is a `replaceState` and the router's own scroll, since a
 *   fragment navigation cannot replace the entry.
 * - A push to the current URL replaces the entry (#2956); `router.push` does
 *   that.
 *
 * @example
 *
 * ```ts
 * const routes = defineRoutes({ home: { segment: '' }, about: {} });
 *
 * const router = createRouter(routes, {
 *   browser: createMemoryBrowser('https://example.com/'),
 * });
 *
 * const click = (
 *   href: string,
 *   init?: Partial<LinkClickEvent>,
 * ): Readonly<{ handled: boolean; prevented: boolean }> => {
 *   const mut_state = { prevented: false };
 *
 *   const handled = handleLinkClick(router, {
 *     defaultPrevented: false,
 *     button: 0,
 *     metaKey: false,
 *     ctrlKey: false,
 *     shiftKey: false,
 *     altKey: false,
 *     currentTarget: { href, target: '', hasAttribute: () => false },
 *     preventDefault: () => {
 *       mut_state.prevented = true;
 *     },
 *     ...init,
 *   });
 *
 *   return { handled, prevented: mut_state.prevented };
 * };
 *
 * // Ctrl+click opens a new tab: the browser's.
 * assert.deepStrictEqual(
 *   click('https://example.com/about/', { ctrlKey: true }),
 *   { handled: false, prevented: false },
 * );
 *
 * assert.deepStrictEqual(click('https://example.com/about/'), {
 *   handled: true,
 *   prevented: true,
 * });
 *
 * assert.strictEqual(router.match.getSnapshot().value.route, 'about');
 * ```
 */
export const handleLinkClick = (
  router: LinkClickRouter,
  event: LinkClickEvent,
  options?: NavigateOptions,
): boolean => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  const anchor = event.currentTarget;

  if (
    (anchor.target !== '' && anchor.target !== '_self') ||
    anchor.hasAttribute('download')
  ) {
    return false;
  }

  const href = router.parseHref(anchor.href);

  if (Optional.isNone(href)) {
    return false;
  }

  event.preventDefault();

  const pushOptions = {
    ...(options?.viewTransition === true
      ? ({ viewTransition: true } as const)
      : {}),
    ...(options?.state === undefined ? {} : { state: options.state }),
  } as const;

  if (options?.replace === true) {
    router.replace(href.value, pushOptions);
  } else {
    router.push(href.value, pushOptions);
  }

  return true;
};
