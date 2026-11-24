import { constant, type Bindable, type JSX } from 'synstate-dom';
import './common.css';

/** A 16×16 stroked path in the text's colour, as a badge's icon is drawn. */
export const PathIcon = ({
  path,
}: Readonly<{ path: Bindable<string> }>): JSX.Element => (
  <svg
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
