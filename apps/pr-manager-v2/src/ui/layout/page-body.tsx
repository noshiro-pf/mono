import { map } from 'synstate';
import { constant, For, If, mountable, type JSX } from 'synstate-dom';
import { Obj } from 'ts-data-forge';
import { columnWidths } from '../../domain/index.mjs';
import type { LayoutStore } from '../../store/index.mjs';
import type { BlockViews } from './block-views.mjs';
import { BoundaryLine } from './boundary-line.js';
import { ColumnLine } from './column-line.js';
import { LayoutBlock } from './layout-block.js';
import { LayoutGroup } from './layout-group.js';
import './layout.css';

type Props = Readonly<{
  layout: LayoutStore;
  views: BlockViews;
}>;

/**
 * The blocks as the layout lays them out (spec §6): columns with a line to drag
 * between each two, each column a list of groups, each group one block or
 * several as tabs, with a line to drag under each.
 *
 * Every block is made once, here, and kept for the page's life: a change of
 * layout moves its element into its new place rather than making it again, so
 * what its body holds (its subscriptions, a typed filter) survives the move.
 */
export const PageBody = ({ layout, views }: Props): JSX.Element => {
  // Mounted here, in the page's scope, rather than by the group that shows the
  // block: a row of a list is unmounted when its key goes, and a block whose
  // group changes would otherwise be made again.
  const blocks = Obj.map(views, (view, id) => {
    const group = layout.drawn.pipe(
      map((drawn) => drawn.flat().find((g) => g.tabs.includes(id))),
    );

    const nodes = (
      <LayoutBlock
        id={id}
        shown={group.pipe(map((g) => g?.shown === id))}
        tabbed={group.pipe(map((g) => (g?.tabs.length ?? 0) > 1))}
        view={view}
      />
    ).mount();

    return mountable(() => nodes);
  });

  const columns = layout.drawn.pipe(
    map((drawn) => drawn.map((groups, index) => ({ index, groups }))),
  );

  const template = layout.layout.pipe(
    map((l) =>
      columnWidths(l)
        .map((width) => `minmax(0, ${width}fr)`)
        .join(' 8px '),
    ),
  );

  return (
    <div
      class={constant('columns')}
      data-mode={layout.layout.pipe(map((l) => l.mode))}
      data-count={layout.layout.pipe(map((l) => l.columns.length.toString()))}
      style={{ '--column-template': template }}
    >
      <For items={columns} key={(column) => column.index}>
        {(column$) => (
          <>
            <If
              cond={column$.pipe(map((c) => c.index > 0))}
              then={
                <ColumnLine
                  layout={layout}
                  line={column$.pipe(map((c) => c.index - 1))}
                />
              }
            />

            <div class={constant('column')}>
              <For
                items={column$.pipe(map((c) => c.groups))}
                key={(group) => group.head}
              >
                {(group$, index$) => (
                  <>
                    <LayoutGroup
                      blocks={blocks}
                      group={group$}
                      layout={layout}
                    />

                    <BoundaryLine
                      group={group$}
                      index={index$}
                      layout={layout}
                      siblings={column$.pipe(map((c) => c.groups))}
                    />
                  </>
                )}
              </For>
            </div>
          </>
        )}
      </For>
    </div>
  );
};
