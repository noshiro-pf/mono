import type * as React from 'react';
import type { ExternalHref, Href } from 'synstate-router';
import type { StrictOmit } from 'ts-type-forge';

export type LinkProps = Readonly<{
  /** A page of the application, or a URL outside it (`externalHref`). */
  to: Href | ExternalHref;
  /** Replace the current history entry instead of adding one. */
  replace?: boolean;
  /**
   * The history state to write with the navigation, as `router.push(href, {
   * state })` takes it: the value the destination page's `state` codec
   * encodes. A click the browser handles (a modifier key, `target`,
   * `download`, an `ExternalHref`) writes none.
   */
  state?: unknown;
  /**
   * Make the navigation inside a View Transition
   * (`document.startViewTransition`); ignored where the browser has none.
   */
  viewTransition?: boolean;
}> &
  StrictOmit<React.ComponentPropsWithRef<'a'>, 'href'>;
