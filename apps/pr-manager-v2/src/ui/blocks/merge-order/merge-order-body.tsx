import { map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { MergeOrderView } from '../../../store/index.mjs';
import { FailuresNotice } from '../../common/index.mjs';
import { MergeOrderTree } from './merge-order-tree.js';
import { PullRequestCard } from './pull-request-card.js';

export const MergeOrderBody = ({
  view,
  now,
}: Readonly<{
  view: InitializedObservable<Ready>;
  now: InitializedObservable<number>;
}>): JSX.Element => {
  const scaleMax = view.pipe(map(({ scaleMax: max }) => max));

  return (
    <div class={constant('merge-order')}>
      <FailuresNotice failures={view.pipe(map(({ failures }) => failures))} />

      <If
        cond={view.pipe(map(({ counts }) => counts.open.total === 0))}
        then={
          <p class={constant('muted')}>{constant('No open pull requests.')}</p>
        }
        else={
          <If
            cond={view.pipe(map(({ tree }) => Arr.isEmpty(tree)))}
            then={
              <p class={constant('muted')}>
                {constant('The filters leave nothing to show.')}
              </p>
            }
          />
        }
      />

      <MergeOrderTree
        depth={0}
        nodes={view.pipe(map(({ tree }) => tree))}
        now={now}
        scaleMax={scaleMax}
      />

      <If
        cond={view.pipe(map(({ cycles }) => Arr.isNonEmpty(cycles)))}
        then={
          <section class={constant('cycles')}>
            <h3>{constant('Merge-After cycles')}</h3>
            <p class={constant('muted')}>
              {constant(
                'Each of these waits, in the end, for itself: none can merge first until a Merge-After: line in one of them goes.',
              )}
            </p>
            <For
              items={view.pipe(map(({ cycles }) => cycles))}
              key={(cycle) => cycle.map(({ number }) => number).join('-')}
            >
              {(cycle$) => (
                <div class={constant('cycle')}>
                  <For items={cycle$} key={({ number }) => number}>
                    {(card$) => (
                      <PullRequestCard
                        card={card$}
                        now={now}
                        scaleMax={scaleMax}
                      />
                    )}
                  </For>
                </div>
              )}
            </For>
          </section>
        }
      />
    </div>
  );
};

type Ready = MergeOrderView & Readonly<{ kind: 'ready' }>;
