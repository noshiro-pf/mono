import { constant, type JSX } from 'synstate-dom';
import { svgAttributes } from './svg-elements.js';

type Props = Readonly<{
  /** Which glyph: the one GitHub's Actions tab draws for the state. */
  kind: 'running' | 'queued';
  /** The state in words: the tooltip, and what a screen reader says. */
  label: string;
}>;

/**
 * A workflow run's state as the Actions tab draws it: a ring turning for one
 * in progress, a dot for one queued. Both in the status amber, which is what
 * GitHub gives them. The ring turns whatever the reader's motion setting
 * (`index.css`).
 *
 * The glyph is `aria-hidden` and the word is beside it, hidden from sight
 * rather than from a screen reader, as a badge's word is beside its icon
 * (`badge-icon.tsx`).
 */
export const RunStateIcon = ({ kind, label }: Props): JSX.Element => (
  <span
    class={constant('run-state-icon')}
    data-kind={constant(kind)}
    title={constant(label)}
  >
    <svg
      ref={notFocusable}
      aria-hidden={constant('true')}
      viewBox={constant('0 0 16 16')}
    >
      {kind === 'running' ? (
        <>
          <circle
            class={constant('run-state-track')}
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
        </>
      ) : (
        <circle cx={constant(8)} cy={constant(8)} r={constant(4)} />
      )}
    </svg>

    <span class={constant('visually-hidden')}>{constant(label)}</span>
  </span>
);

const notFocusable = svgAttributes({ focusable: 'false' });
