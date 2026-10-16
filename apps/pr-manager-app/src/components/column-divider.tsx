import type { PointerEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
import { splitAt, type LineIndex } from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';

type Props = Readonly<{
  /** Which line between the columns this is, from the left. */
  line: LineIndex;
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
export const ColumnDivider = memoNamed<Props>('ColumnDivider', (props) => {
  const { line } = props;

  const onPointerMove = useCallback<PointerEventHandler<HTMLDivElement>>(
    (moved) => {
      const box = moved.currentTarget.parentElement?.getBoundingClientRect();

      if (
        box === undefined ||
        !moved.currentTarget.hasPointerCapture(moved.pointerId)
      ) {
        return;
      }

      const at = splitAt(moved.clientX, box);

      if (at !== undefined) {
        layoutStore.setLine(line, at);
      }
    },
    [line],
  );

  const onDoubleClick = useCallback((): void => {
    layoutStore.evenLine(line);
  }, [line]);

  return (
    <div
      aria-hidden={'true'}
      className={'column-divider'}
      title={'Drag to share the width; double-click to even it'}
      onDblClick={onDoubleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    />
  );
});

// Outside the component, since it does not read its props: one function
// serves every render, with no `useCallback` to keep it stable.

const onPointerDown: PointerEventHandler<HTMLDivElement> = (pressed) => {
  if (pressed.button !== 0) {
    return;
  }

  pressed.preventDefault();

  pressed.currentTarget.setPointerCapture(pressed.pointerId);
};
