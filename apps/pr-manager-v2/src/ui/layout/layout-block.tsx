import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import type { BlockId } from '../../domain/index.mjs';
import type { BlockView } from './block-views.mjs';

export const LayoutBlock = ({
  id,
  shown,
  tabbed,
  view,
}: Readonly<{
  id: BlockId;
  shown: InitializedObservable<boolean>;
  tabbed: InitializedObservable<boolean>;
  view: BlockView;
}>): JSX.Element => (
  <section
    aria-labelledby={tabbed.pipe(
      map((t) => (t ? `tab-${id}` : `block-title-${id}`)),
    )}
    class={constant('block')}
    data-block={constant(id)}
    data-tabbed={tabbed.pipe(map((t) => t.toString()))}
    hidden={shown.pipe(map((s) => !s))}
    id={constant(`block-${id}`)}
    role={tabbed.pipe(map((t) => (t ? 'tabpanel' : 'region')))}
  >
    <div class={constant('block-title')}>
      <h2 id={constant(`block-title-${id}`)}>{view.title}</h2>

      {view.extras ?? []}
    </div>

    <div class={constant('block-body')}>{view.body()}</div>
  </section>
);
