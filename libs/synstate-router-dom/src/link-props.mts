import type { Bindable, JSX } from 'synstate-dom';
import type { ExternalHref, Href } from 'synstate-router';
import type { StrictOmit } from 'ts-type-forge';

export type LinkProps = Readonly<{
  /**
   * A page of the application, or a URL outside it (`externalHref`); an
   * observable of either for a link whose destination changes.
   */
  to: Href | ExternalHref | Bindable<Href | ExternalHref>;
  /** Replace the current history entry instead of adding one. */
  replace?: boolean;
}> &
  StrictOmit<JSX.IntrinsicElements['a'], 'href'>;
