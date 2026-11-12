import type { InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import { withEvenLine, withLineAt } from '../../domain/index.mjs';
import type { LayoutStore } from '../../store/index.mjs';
import { dragFrom } from './drag.mjs';

/** The line between two columns: drag to share the width, double-click to even. */
export const ColumnLine = ({
  layout,
  line,
}: Readonly<{
  layout: LayoutStore;
  line: InitializedObservable<number>;
}>): JSX.Element => {
  const which = (): 0 | 1 => (line.getSnapshot().value === 0 ? 0 : 1);

  return (
    <div
      aria-hidden={constant('true')}
      class={constant('column-line')}
      title={constant(
        'Drag to share the width; double-click to even the two beside it',
      )}
      onDblClick={() => {
        layout.change((l) => withEvenLine(l, which()));
      }}
      onPointerDown={(event) => {
        const box = event.currentTarget.parentElement?.getBoundingClientRect();

        const width = box?.width ?? 0;

        if (box === undefined || !Num.isNonZero(width)) {
          return;
        }

        dragFrom(event, (x) => {
          layout.change((l) =>
            withLineAt(l, which(), Num.div(x - box.left, width) * 100),
          );
        });
      }}
    />
  );
};
