import type { ComponentChildren } from 'preact';
import { memoNamed } from 'preact-utils';

type Props = Readonly<{
  href: string;
  children: ComponentChildren;
  /**
   * What the link is, rather than what it should look like: `className` on a
   * component is what `react/forbid-component-props` forbids, and rightly —
   * a caller passing one is a caller reaching across this boundary to style
   * what is on the other side of it.
   */
  variant?:
    | 'issue-dag-link'
    | 'pull-request-title'
    | 'queue-link'
    | 'section-link'
    | 'split-view';
  /** `open` / `closed` / `unknown`, for the linked issue chips. */
  dataState?: string;
  title?: string;
  /** Pointed at or focused, for a tooltip drawn apart from the link. */
  onEnter?: () => void;
  /** No longer pointed at, or no longer focused. */
  onLeave?: () => void;
}>;

/**
 * Every link this page draws, because every one of them leaves it.
 *
 * The page is a thing to leave open — it polls, it keeps a clock, and a
 * reader following a pull request into GitHub and coming back with the back
 * button would find it reloading and spending a request to say what it was
 * already showing. So they open in a tab of their own.
 *
 * One component rather than the attributes written out twelve times, so that
 * the thirteenth link cannot be the one that forgets. `noreferrer` implies
 * `noopener`, which is what keeps the opened page from reaching back through
 * `window.opener`.
 */
export const ExternalLink = memoNamed<Props>(
  'ExternalLink',
  ({ href, children, variant, dataState, title, onEnter, onLeave }) => (
    <a
      className={variant}
      data-state={dataState}
      href={href}
      rel={'noreferrer'}
      target={'_blank'}
      title={title}
      onBlur={onLeave}
      onFocus={onEnter}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
    </a>
  ),
);
