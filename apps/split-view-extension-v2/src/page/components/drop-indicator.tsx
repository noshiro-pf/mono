import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import type { DropTarget } from '../../core/index.mjs';

/**
 * What a drop would do (spec L7): the middle highlights the whole pane and
 * swaps, an edge highlights the half the moved pane would take.
 */
export const DropIndicator = ({
  target$,
}: Readonly<{
  target$: InitializedObservable<DropTarget | undefined>;
}>): JSX.Element => (
  <div
    class={constant('drop-indicator')}
    style={{
      left: target$.pipe(map((target) => px(target?.indicator.left))),
      top: target$.pipe(map((target) => px(target?.indicator.top))),
      width: target$.pipe(map((target) => px(target?.indicator.width))),
      height: target$.pipe(map((target) => px(target?.indicator.height))),
    }}
  >
    <span class={constant('drop-indicator__label')}>
      {target$.pipe(
        map((target) => (target?.zone === 'center' ? 'Swap' : 'Move here')),
      )}
    </span>
  </div>
);

export const px = (value: number | undefined): string | undefined =>
  value === undefined ? undefined : (`${value.toString()}px` as const);
