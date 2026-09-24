import * as React from 'react';

type Props = Readonly<{
  /** The `d` of one path, drawn on a 16×16 viewBox. */
  path: string;
}>;

/**
 * The glyph a badge carries beside its word.
 *
 * Inline rather than an `<img>`: it inherits `currentColor` from the badge,
 * so one drawing serves every status colour and dark mode, and the page's
 * `img-src` never comes into it. `aria-hidden` because the word beside it is
 * the label.
 */
export const BadgeIcon = React.memo<Props>(({ path }) => (
  <svg
    aria-hidden={'true'}
    className={'badge-icon'}
    fill={'none'}
    focusable={'false'}
    stroke={'currentColor'}
    strokeLinecap={'round'}
    strokeLinejoin={'round'}
    strokeWidth={1.6}
    viewBox={'0 0 16 16'}
  >
    <path d={path} />
  </svg>
));

BadgeIcon.displayName = 'BadgeIcon';
