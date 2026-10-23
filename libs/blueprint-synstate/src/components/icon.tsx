import { constant, type Bindable, type JSX } from 'synstate-dom';

/** The icons this package draws. */
export type IconName = keyof typeof ICON_PATHS_16;

type Props = Readonly<{
  icon: IconName;
  /** Classes after Blueprint's own, such as `rdp-nav_icon`. */
  class?: string;
  style?: Bindable<string>;
}>;

/**
 * Blueprint's `Icon` at 16px: `span.bp6-icon.bp6-icon-<name>` round the
 * inline SVG, which is what Blueprint's style sheets size and colour.
 *
 * Hidden from assistive technology, always: each icon here sits on a control
 * whose own label says what it does. Blueprint gives the SVG a `<title>`
 * instead where it is told to, which synstate-dom would create in the HTML
 * namespace rather than the SVG one.
 */
export const Icon = ({ icon, class: className, style }: Props): JSX.Element => (
  <span
    aria-hidden={constant('true')}
    class={constant(
      className === undefined
        ? `bp6-icon bp6-icon-${icon}`
        : `bp6-icon bp6-icon-${icon} ${className}`,
    )}
    {...(style === undefined ? {} : { style })}
  >
    <svg
      data-icon={constant(icon)}
      height={constant(16)}
      role={constant('img')}
      viewBox={constant('0 0 16 16')}
      width={constant(16)}
    >
      <path d={constant(ICON_PATHS_16[icon])} fill-rule={constant('evenodd')} />
    </svg>
  </span>
);

/**
 * The 16px paths of Blueprint's icons, as `@blueprintjs/icons` (6.14) has
 * them in `lib/esm/generated/16px/paths/`. Copied: the package is reachable
 * only through internal module paths, and it would bring React along.
 */
const ICON_PATHS_16 = {
  'chevron-down':
    'M12 5c-.28 0-.53.11-.71.29L8 8.59l-3.29-3.3a1.003 1.003 0 0 0-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l4-4A1.003 1.003 0 0 0 12 5',
  'chevron-left':
    'm7.41 8 3.29-3.29c.19-.18.3-.43.3-.71a1.003 1.003 0 0 0-1.71-.71l-4 4C5.11 7.47 5 7.72 5 8s.11.53.29.71l4 4a1.003 1.003 0 0 0 1.42-1.42z',
  'chevron-right':
    'm10.71 7.29-4-4a1.003 1.003 0 0 0-1.42 1.42L8.59 8 5.3 11.29c-.19.18-.3.43-.3.71a1.003 1.003 0 0 0 1.71.71l4-4c.18-.18.29-.43.29-.71s-.11-.53-.29-.71',
  'chevron-up':
    'm12.71 9.29-4-4C8.53 5.11 8.28 5 8 5s-.53.11-.71.29l-4 4a1.003 1.003 0 0 0 1.42 1.42L8 7.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 0 0 .71-1.71',
  cog: 'M15.19 6.39h-1.85c-.11-.37-.27-.71-.45-1.04l1.36-1.36c.31-.31.31-.82 0-1.13l-1.13-1.13a.803.803 0 0 0-1.13 0l-1.36 1.36c-.33-.17-.67-.33-1.04-.44V.79c0-.44-.36-.8-.8-.8h-1.6c-.44 0-.8.36-.8.8v1.86c-.39.12-.75.28-1.1.47l-1.3-1.3c-.3-.3-.79-.3-1.09 0L1.82 2.91c-.3.3-.3.79 0 1.09l1.3 1.3c-.2.34-.36.7-.48 1.09H.79c-.44 0-.8.36-.8.8v1.6c0 .44.36.8.8.8h1.85c.11.37.27.71.45 1.04l-1.36 1.36c-.31.31-.31.82 0 1.13l1.13 1.13c.31.31.82.31 1.13 0l1.36-1.36c.33.18.67.33 1.04.44v1.86c0 .44.36.8.8.8h1.6c.44 0 .8-.36.8-.8v-1.86c.39-.12.75-.28 1.1-.47l1.3 1.3c.3.3.79.3 1.09 0l1.09-1.09c.3-.3.3-.79 0-1.09l-1.3-1.3c.19-.35.36-.71.48-1.1h1.85c.44 0 .8-.36.8-.8v-1.6a.816.816 0 0 0-.81-.79m-7.2 4.6c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3',
  'double-caret-vertical':
    'M5 7h6a1.003 1.003 0 0 0 .71-1.71l-3-3C8.53 2.11 8.28 2 8 2s-.53.11-.71.29l-3 3A1.003 1.003 0 0 0 5 7m6 2H5a1.003 1.003 0 0 0-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 0 0 11 9',
} as const;
