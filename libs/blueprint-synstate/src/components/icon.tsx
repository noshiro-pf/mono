import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import { ICON_PATHS_16, ICON_PATHS_20 } from '../internal/index.mjs';
import type { Intent } from './intent.mjs';

/** The icons this package draws. */
export type IconName = keyof typeof ICON_PATHS_16;

/** The icons this package also draws at 20px, `IconSize.LARGE`, and up. */
export type IconName20 = keyof typeof ICON_PATHS_20;

/** The sizes from 20px up, drawn from the 20px paths. */
export type LargeIconSize = 20 | 28 | 32 | 40 | 48;

/** The sizes below 20px, drawn from the 16px paths. */
export type SmallIconSize = 12 | 16;

type Props = Readonly<
  {
    /** Classes after Blueprint's own, such as `rdp-nav_icon`. */
    class?: string;
    style?: Bindable<string>;
    /** The SVG's `fill`, over the colour Blueprint's style sheets give it. */
    color?: string;
    /** Blueprint's intent colour (`bp6-intent-*`). */
    intent?: Intent;
  } & (
    | {
        /** A name, or one that changes: the drawing follows it. */
        icon: Bindable<IconName> | IconName;
        /** 16 by default; 12 scales the 16px drawing down, as Blueprint does. */
        size?: SmallIconSize;
      }
    | {
        icon: Bindable<IconName20> | IconName20;
        /**
         * `IconSize.LARGE` (20), an `Alert`'s 40, a `NonIdealState`'s 32 or 48,
         * or a heading's 28: the 20px drawing, scaled to this many pixels, as
         * Blueprint draws any size from 20 up.
         */
        size: LargeIconSize;
      }
  )
>;

/**
 * Blueprint's `Icon` at 16px, or at 20px or more for the icons in
 * {@link IconName20}:
 * `span.bp6-icon.bp6-icon-<name>` round the inline SVG, which is what
 * Blueprint's style sheets size and colour.
 *
 * Hidden from assistive technology, always: each icon here sits on a control
 * whose own label says what it does. Blueprint gives the SVG a `<title>`
 * instead where it is told to, which synstate-dom would create in the HTML
 * namespace rather than the SVG one.
 */
export const Icon = ({
  class: className,
  style,
  color,
  intent = 'none',
  icon,
  size,
}: Props): JSX.Element => {
  const pixels = size ?? 16;

  const large =
    size === 20 || size === 28 || size === 32 || size === 40 || size === 48;

  const classes = [
    ...(intent === 'none' ? [] : [`bp6-intent-${intent}`]),
    ...(className === undefined ? [] : [className]),
  ].join(' ');

  const grid = large ? 20 : 16;

  const name$: Bindable<string> =
    typeof icon === 'string' ? constant(icon) : icon;

  const path$ = large
    ? mapBindable(
        typeof icon === 'string' ? constant(icon) : icon,
        (name) => ICON_PATHS_20[name],
      )
    : mapBindable(
        typeof icon === 'string' ? constant(icon) : icon,
        (name) => ICON_PATHS_16[name],
      );

  return (
    <span
      aria-hidden={constant('true')}
      class={mapBindable(name$, (name) =>
        classes === ''
          ? `bp6-icon bp6-icon-${name}`
          : `bp6-icon bp6-icon-${name} ${classes}`,
      )}
      {...(style === undefined ? {} : { style })}
    >
      <svg
        data-icon={name$}
        {...(color === undefined ? {} : { fill: constant(color) })}
        height={constant(pixels)}
        role={constant('img')}
        viewBox={constant(`0 0 ${grid.toString()} ${grid.toString()}`)}
        width={constant(pixels)}
      >
        <path d={path$} fill-rule={constant('evenodd')} />
      </svg>
    </span>
  );
};
