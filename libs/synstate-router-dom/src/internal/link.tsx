import { isObservable } from 'synstate';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import {
  handleLinkClick,
  isHref,
  type AnyRoutes,
  type ExternalHref,
  type Href,
  type Router,
} from 'synstate-router';
import type { LinkProps } from '../link-props.mjs';

/** `Link` bound to `router` (`RouterComponents['Link']`). */
export const createLink =
  <R extends AnyRoutes>(
    router: Router<R>,
  ): ((props: LinkProps) => JSX.Element) =>
  ({ to, replace, onClick, ...anchorProps }) => {
    // A plain `Href` is a destination that does not change: a constant, as
    // synstate-dom takes one.
    const destination: Bindable<Href | ExternalHref> =
      typeof to === 'string' ? constant(to) : to;

    const current = readerOf(destination);

    return (
      <a
        {...anchorProps}
        href={mapBindable(destination, (target) =>
          isHref(target) ? router.toUrl(target) : target,
        )}
        onClick={(clickEvent) => {
          onClick?.(clickEvent);

          // An `ExternalHref` is the browser's, even to this origin.
          if (isHref(current())) {
            handleLinkClick(router, clickEvent, { replace });
          }
        }}
      />
    );
  };

/**
 * Reads the current value of `bindable` when called, without building an
 * observable for it: `Link` needs the destination only when it is clicked.
 */
const readerOf = <T extends string>(bindable: Bindable<T>): (() => T) =>
  isObservable(bindable) ? () => bindable.getSnapshot().value : () => bindable;
