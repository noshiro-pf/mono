import { constant, type Bindable, type JSX } from 'synstate-dom';
import { svgAttributes } from './svg-elements.js';

type Props = Readonly<{
  /** The `d` of one path, drawn on a 16×16 viewBox. */
  path: Bindable<string>;
}>;

/**
 * The glyph a badge carries beside its word.
 *
 * Inline rather than an `<img>`: it inherits `currentColor` from the badge, so
 * one drawing serves every status colour and dark mode, and the page's
 * `img-src` never comes into it. `aria-hidden` because the word beside it is
 * the label.
 */
export const BadgeIcon = ({ path }: Props): JSX.Element => (
  <svg
    ref={notFocusable}
    aria-hidden={constant('true')}
    class={constant('badge-icon')}
    fill={constant('none')}
    stroke={constant('currentColor')}
    stroke-linecap={constant('round')}
    stroke-linejoin={constant('round')}
    stroke-width={constant(1.6)}
    viewBox={constant('0 0 16 16')}
  >
    <path d={path} />
  </svg>
);

const notFocusable = svgAttributes({ focusable: 'false' });
