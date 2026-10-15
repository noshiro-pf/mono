import type { KeyboardEventHandler, MouseEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { Num } from 'ts-data-forge';
import type { Point } from '../dag/index.mjs';

type Props = Readonly<{
  /** Where the edge was clicked, in content coordinates. */
  at: Point;
  /** The view's, for the button to keep its size on the screen. */
  scale: number;
  /** What it deletes, for a screen reader. */
  label: string;
  onDelete: () => void;
  /** Leaves the edge as it is, and the button goes. */
  onDismiss: () => void;
}>;

/**
 * The button that deletes the dependency an edge of the DAG stands for,
 * where the edge was clicked (`dag-canvas.tsx`). It takes the focus as it
 * comes, so that Delete or Backspace — or Enter or Space, as on any button —
 * deletes the edge at once; Escape, or the focus going anywhere else, leaves
 * the edge as it is.
 */
export const DagEdgeDelete = memoNamed<Props>('DagEdgeDelete', (props) => {
  const { at, scale, label, onDelete, onDismiss } = props;

  const button = useRef<SVGGElement>(null);

  // Again for every click, which may be on the edge already selected.
  useEffect(() => {
    button.current?.focus({ preventScroll: true });
  }, [at]);

  const onClick = useCallback<MouseEventHandler<SVGGElement>>(
    (clicked) => {
      // Not a click on the background, which would only dismiss it.
      clicked.stopPropagation();

      onDelete();
    },
    [onDelete],
  );

  const onKeyDown = useCallback<KeyboardEventHandler<SVGGElement>>(
    (pressed) => {
      if (DELETE_KEYS.has(pressed.key)) {
        pressed.preventDefault();

        onDelete();

        return;
      }

      if (pressed.key !== 'Escape') {
        return;
      }

      pressed.preventDefault();

      onDismiss();
    },
    [onDelete, onDismiss],
  );

  const radius = Num.isNonZero(scale) ? Num.div(RADIUS_PX, scale) : RADIUS_PX;

  const cross = radius * CROSS_RATIO;

  return (
    // An SVG has no <button>: the group takes its role, focus and keys.
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    <g
      ref={button}
      aria-label={label}
      className={'dag-edge-delete'}
      data-e2e={'dag-edge-delete'}
      role={'button'}
      // Lower case: Preact sets an SVG element's props as attributes, and
      // an SVG attribute `tabIndex` is not `tabindex` — no focus at all.
      // eslint-disable-next-line react/no-unknown-property
      tabindex={0}
      transform={`translate(${at.x} ${at.y})`}
      onBlur={onDismiss}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <title>{label}</title>
      <circle className={'dag-edge-delete-circle'} r={radius} />
      <path
        className={'dag-edge-delete-cross'}
        d={`M ${-cross} ${-cross} L ${cross} ${cross} M ${cross} ${-cross} L ${-cross} ${cross}`}
      />
    </g>
  );
});

/** Of the button, on the screen. */
const RADIUS_PX = 11;

/** Half the width of the cross, as a share of the radius. */
const CROSS_RATIO = 0.4;

const DELETE_KEYS: ReadonlySet<string> = new Set([
  'Delete',
  'Backspace',
  'Enter',
  ' ',
]);
