import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import {
  dividerKeyOf,
  dividerValue,
  firstPxAfterKey,
  type Divider,
} from '../../core/index.mjs';
import { px } from './drop-indicator.js';

/**
 * A divider between two panes (spec L9): dragged with the pointer, and a
 * focusable `separator` that the arrow keys move by 2% and `Home` / `End` move
 * to the ends of its range, with its position announced as a percentage.
 */
export const DividerHandle = ({
  divider$,
  onDragStart,
  onResize,
}: Readonly<{
  divider$: InitializedObservable<Divider>;
  onDragStart: (divider: Divider) => void;
  onResize: (divider: Divider, firstPx: number) => void;
}>): JSX.Element => {
  const value$ = divider$.pipe(map(dividerValue));

  return (
    <div
      aria-label={divider$.pipe(
        map(({ axis }) =>
          axis === 'row'
            ? 'Resize the panes to the left and right'
            : 'Resize the panes above and below',
        ),
      )}
      // A row split is a vertical line.
      aria-orientation={divider$.pipe(
        map(({ axis }) => (axis === 'row' ? 'vertical' : 'horizontal')),
      )}
      aria-valuemax={value$.pipe(map(({ max }) => max.toString()))}
      aria-valuemin={value$.pipe(map(({ min }) => min.toString()))}
      aria-valuenow={value$.pipe(map(({ now }) => now.toString()))}
      class={divider$.pipe(map(({ axis }) => `divider divider--${axis}`))}
      data-e2e={constant('divider')}
      role={constant('separator')}
      style={{
        left: divider$.pipe(map(({ rect }) => px(rect.left))),
        top: divider$.pipe(map(({ rect }) => px(rect.top))),
        width: divider$.pipe(map(({ rect }) => px(rect.width))),
        height: divider$.pipe(map(({ rect }) => px(rect.height))),
      }}
      tabIndex={constant(0)}
      onKeyDown={(event) => {
        const divider = divider$.getSnapshot().value;

        const key = dividerKeyOf(divider.axis, event.key);

        if (key === undefined) {
          return;
        }

        event.preventDefault();

        onResize(divider, firstPxAfterKey(divider, key));
      }}
      onPointerDown={(event) => {
        // Otherwise the press starts a selection that follows the drag.
        event.preventDefault();

        event.currentTarget.focus();

        onDragStart(divider$.getSnapshot().value);
      }}
    />
  );
};
