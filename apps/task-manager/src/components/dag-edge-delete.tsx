import type { InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import type { EdgeDeleteState } from './dag-canvas-scene.mjs';
import { createAfterUpdate, subscribeInScope } from './scope-effects.mjs';
import { SvgTitle } from './svg-title.js';

type Props = Readonly<{
  button: InitializedObservable<EdgeDeleteState>;
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
export const DagEdgeDelete = ({
  button,
  onDelete,
  onDismiss,
}: Props): JSX.Element => {
  const label = view(button, (state) => state.label);

  return (
    // An SVG has no <button>: the group takes its role, focus and keys.

    <g
      ref={(element) => {
        const afterUpdate = createAfterUpdate();

        const mut_focused: { at: EdgeDeleteState['at'] | undefined } = {
          at: undefined,
        };

        // Again for every click, which may be on the edge already selected.
        subscribeInScope(button, ({ at }) => {
          if (mut_focused.at === at) {
            return;
          }

          mut_focused.at = at;

          afterUpdate(() => {
            element.focus({ preventScroll: true });
          });
        });
      }}
      aria-label={label}
      class={constant('dag-edge-delete')}
      data-e2e={constant('dag-edge-delete')}
      role={constant('button')}
      tabindex={constant(0)}
      transform={view(button, ({ at }) => `translate(${at.x} ${at.y})`)}
      onBlur={onDismiss}
      onClick={(clicked) => {
        // Not a click on the background, which would only dismiss it.
        clicked.stopPropagation();

        onDelete();
      }}
      onKeyDown={(pressed) => {
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
      }}
    >
      <SvgTitle>{label}</SvgTitle>
      <circle
        class={constant('dag-edge-delete-circle')}
        r={view(button, radius)}
      />
      <path
        class={constant('dag-edge-delete-cross')}
        d={view(button, (state) => {
          const cross = radius(state) * CROSS_RATIO;

          return `M ${-cross} ${-cross} L ${cross} ${cross} M ${cross} ${-cross} L ${-cross} ${cross}`;
        })}
      />
    </g>
  );
};

/** Of the button, on the screen. */
const RADIUS_PX = 11;

/** Half the width of the cross, as a share of the radius. */
const CROSS_RATIO = 0.4;

const DELETE_KEYS: ReadonlySet<string> = new Set<string>([
  'Delete',
  'Backspace',
  'Enter',
  ' ',
]);

/** {@link RADIUS_PX} in content coordinates. */
const radius = (state: EdgeDeleteState): number =>
  Num.isNonZero(state.scale) ? Num.div(RADIUS_PX, state.scale) : RADIUS_PX;
