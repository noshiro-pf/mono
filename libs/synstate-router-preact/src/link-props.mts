import type { ComponentProps } from 'preact';
import type { ExternalHref, Href } from 'synstate-router';
import type { StrictOmit } from 'ts-type-forge';

export type LinkProps = Readonly<{
  /** A page of the application, or a URL outside it (`externalHref`). */
  to: Href | ExternalHref;
  /** Replace the current history entry instead of adding one. */
  replace?: boolean;
}> & // Preact passes no `ref` to a function component, and forwarding one would
  // take `preact/compat`, whose import rewrites every element's props in the
  // whole application (`onChange` on a text input becomes `onInput`). So `Link`
  // takes none.
  StrictOmit<ComponentProps<'a'>, 'href' | 'ref'>;
