import { memoNamed } from 'react-utils';

export type IconName =
  | 'back'
  | 'clear-sw'
  | 'close'
  | 'external'
  | 'forward'
  | 'grip'
  | 'lock'
  | 'minus'
  | 'more'
  | 'plus'
  | 'reload'
  | 'split-down'
  | 'split-right'
  | 'unlock'
  | 'warning';

/**
 * The interface's icons, drawn here rather than taken from a library.
 *
 * They were emoji and arrows — 🔒, ⬌, ↗, ⠿ — which is a font's idea of what
 * those mean rather than ours: the grip came out as a smudge on one platform
 * and the padlocks as the same glyph on another, and `−` had to be swapped
 * twice to find a minus of the right width. A dozen paths of our own render
 * the same everywhere and weigh a couple of kilobytes, against the hundreds an
 * icon set costs for a toolbar this size.
 *
 * All of them are 16x16 strokes in `currentColor`, so a pane's toolbar goes on
 * colouring them through the CSS it already has — dim, active, warning — and
 * `aria-hidden` because every button carrying one is labelled.
 */
export const Icon = memoNamed(
  'Icon',
  ({ icon: iconName }: Readonly<{ icon: IconName }>) => {
    const icon = icons[iconName];

    return (
      <svg
        aria-hidden
        className={'icon'}
        focusable={'false'}
        viewBox={'0 0 16 16'}
      >
        {(icon.fills ?? []).map((d) => (
          <path key={d} d={d} fill={'currentColor'} />
        ))}
        {(icon.strokes ?? []).map((d) => (
          <path
            key={d}
            d={d}
            fill={'none'}
            stroke={'currentColor'}
            strokeLinecap={'round'}
            strokeLinejoin={'round'}
            strokeWidth={icon.width ?? 1.4}
          />
        ))}
      </svg>
    );
  },
);

type IconShape = Readonly<{
  /** Outlines, in `currentColor`. */
  strokes?: readonly string[];
  /**
   * Solid shapes, also in `currentColor`.
   *
   * A 14px icon has room for about three strokes across, so anything that
   * would be a thin outlined box — a pane, a padlock's body — is drawn solid
   * instead. Outlined, the interior closes up and the shape stops being
   * readable.
   */
  fills?: readonly string[];
  /** Heavier where the shape is dots rather than lines. */
  width?: number;
}>;

const icons: Readonly<Record<IconName, IconShape>> = {
  back: { strokes: ['M13 8H3.5', 'M7.5 3.5 3 8l4.5 4.5'] },
  forward: { strokes: ['M3 8h9.5', 'M8.5 3.5 13 8l-4.5 4.5'] },

  // A three-quarter turn, so that the gap reads as motion rather than as a
  // circle that failed to close.
  reload: { strokes: ['M13 8a5 5 0 1 1-1.9-3.9', 'M13.2 3.2v3.4h-3.4'] },

  minus: { strokes: ['M3.5 8h9'] },

  // Three dots: there is more of this than fits.
  more: {
    strokes: ['M3.6 8v.01', 'M8 8v.01', 'M12.4 8v.01'],
    width: 2,
  },

  // A circle with a slash through it: the thing this removes.
  'clear-sw': {
    strokes: [
      'M8 2.9a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2z',
      'M4.4 4.4l7.2 7.2',
    ],
  },
  plus: { strokes: ['M8 3.5v9', 'M3.5 8h9'] },

  // The arrow leaves through the corner the box does not have. It stops short
  // of the box, or the two read as one scribble.
  external: {
    strokes: ['M11 9v3.6H3.6V5.2h3.6', 'M8.8 3.6h3.6v3.6', 'M12.4 3.6 9.3 6.7'],
  },

  lock: {
    fills: ['M3.6 7.6h8.8v5.6H3.6z'],
    strokes: ['M6 7.6V5.4a2 2 0 0 1 4 0v2.2'],
  },

  // The shackle is off its post. The button carrying this is coloured as a
  // warning by the toolbar's own CSS, so the icon does not have to say so
  // twice.
  unlock: {
    fills: ['M3.6 7.6h8.8v5.6H3.6z'],
    strokes: ['M6 7.6V5.4a2 2 0 0 1 3.8-.8'],
  },

  // Two panes with a gutter, rather than one box with a line in it: at 14px a
  // line inside a box reads as a window, and the two directions become
  // impossible to tell apart.
  'split-right': {
    fills: ['M2.6 3.6h4.2v8.8H2.6z', 'M9.2 3.6h4.2v8.8H9.2z'],
  },
  'split-down': {
    fills: ['M3.6 2.6h8.8v4.2H3.6z', 'M3.6 9.2h8.8v4.2H3.6z'],
  },

  close: { strokes: ['M4 4l8 8', 'M12 4l-8 8'] },

  warning: { strokes: ['M8 2.8 14.2 13.2H1.8z', 'M8 6.6v3.1', 'M8 11.6v.01'] },

  // Six dots as round-capped zero-length strokes, which is what a grip is and
  // what a stroke can draw.
  grip: {
    strokes: [
      'M6 4.2v.01',
      'M10 4.2v.01',
      'M6 8v.01',
      'M10 8v.01',
      'M6 11.8v.01',
      'M10 11.8v.01',
    ],
    width: 2,
  },
};
