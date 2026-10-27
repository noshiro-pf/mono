import { constant, type JSX } from 'synstate-dom';
import { splitAt, type LineIndex } from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';

type Props = Readonly<{
  /**
   * The line before the middle column, or the one before the right: `0` or
   * `1` with three columns, and `0` either way with two. Resolved when it is
   * dragged, so that going from two columns to three keeps the line drawn.
   */
  position: 'first' | 'last';
}>;

/**
 * A line between two columns, dragged to share the width differently, and
 * double-clicked to even the two columns beside it.
 *
 * A drag reads the pointer against the whole layout's box, so the line
 * follows the pointer rather than a distance moved. Pointer-only, and hidden
 * from assistive technology for it: the keyboard's way to the same thing is
 * the sliders in the layout settings, which are real controls rather than a
 * `separator` that would have to be taught to be one.
 */
export const ColumnDivider = ({ position }: Props): JSX.Element => {
  const line = (): LineIndex =>
    position === 'last' && layoutStore.layout.getSnapshot().value.columns === 3
      ? 1
      : 0;

  return (
    <div
      aria-hidden={constant('true')}
      class={constant('column-divider')}
      title={constant('Drag to share the width; double-click to even it')}
      onDblClick={() => {
        layoutStore.evenLine(line());
      }}
      onPointerDown={onPointerDown}
      onPointerMove={(moved) => {
        const box = moved.currentTarget.parentElement?.getBoundingClientRect();

        if (
          box === undefined ||
          !moved.currentTarget.hasPointerCapture(moved.pointerId)
        ) {
          return;
        }

        const at = splitAt(moved.clientX, box);

        if (at !== undefined) {
          layoutStore.setLine(line(), at);
        }
      }}
    />
  );
};

const onPointerDown = (
  pressed: PointerEvent & Readonly<{ currentTarget: HTMLDivElement }>,
): void => {
  if (pressed.button !== 0) {
    return;
  }

  pressed.preventDefault();

  pressed.currentTarget.setPointerCapture(pressed.pointerId);
};
