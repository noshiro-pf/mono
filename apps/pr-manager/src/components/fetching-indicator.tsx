import { constant, view, type JSX } from 'synstate-dom';
import { reader } from '../store/index.mjs';
import { svgAttributes } from './svg-elements.js';

type Props = Readonly<{
  /** The ring alone, its word for a screen reader and the tooltip only. */
  compact: boolean;
}>;

/**
 * Beside when the report on screen was read, while a newer read is out
 * (`reader.fetching`): a ring turning and "Updating…". What is shown may be the
 * report kept from the last visit or the last poll, minutes old, and without
 * this a reader cannot tell a page about to change from one that has stopped.
 *
 * In the accent colour rather than the status amber, which on this page means a
 * workflow run going. While no read is out it is hidden rather than taken away
 * (`index.css`): every poll would otherwise add a line and take it away again
 * on a screen narrow enough to wrap it onto one of its own, moving the whole
 * page by it.
 */
export const FetchingIndicator = ({ compact }: Props): JSX.Element => (
  <span
    class={constant('fetching-indicator')}
    data-active={view(reader.fetching, (out) => (out ? 'true' : 'false'))}
    title={constant(LABEL)}
  >
    <svg
      ref={notFocusable}
      aria-hidden={constant('true')}
      viewBox={constant('0 0 16 16')}
    >
      <circle
        class={constant('fetching-track')}
        cx={constant(8)}
        cy={constant(8)}
        fill={constant('none')}
        r={constant(6)}
        stroke-width={constant(2)}
      />
      <path
        d={constant('M8 2a6 6 0 0 1 6 6')}
        fill={constant('none')}
        stroke-linecap={constant('round')}
        stroke-width={constant(2)}
      />
    </svg>

    <span class={constant(compact ? 'visually-hidden' : 'fetching-label')}>
      {constant(LABEL)}
    </span>
  </span>
);

const LABEL = 'Updating…';

const notFocusable = svgAttributes({ focusable: 'false' });
