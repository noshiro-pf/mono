import { map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  withSelectedTab,
  type BlockId,
  type DrawnGroup,
} from '../../domain/index.mjs';
import type { LayoutStore } from '../../store/index.mjs';
import { TabList } from './tab-list.js';

export const LayoutGroup = ({
  blocks,
  group,
  layout,
}: Readonly<{
  blocks: ReadonlyRecord<BlockId, JSX.Element>;
  group: InitializedObservable<DrawnGroup>;
  layout: LayoutStore;
}>): JSX.Element => (
  <div
    class={constant('group')}
    data-fixed={group.pipe(map((g) => (g.height !== undefined).toString()))}
    data-head={group.pipe(map((g) => g.head))}
    style={{
      '--fixed-height': group.pipe(
        map((g) => (g.height === undefined ? 'auto' : `${g.height}px`)),
      ),
      '--share': group.pipe(map((g) => g.share.toString())),
    }}
  >
    <If
      cond={group.pipe(map((g) => g.tabs.length > 1))}
      then={
        <TabList
          group={group}
          select={(id) => {
            layout.change((l) => withSelectedTab(l, id));
          }}
        />
      }
    />

    <For items={group.pipe(map((g) => g.tabs))} key={(id) => id}>
      {(id$) => blocks[id$.getSnapshot().value]}
    </For>
  </div>
);
