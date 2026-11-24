import {
  combine,
  map,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Arr, fastDeepEqual } from 'ts-data-forge';
import {
  foldNodeOf,
  layersBelow,
  type MergeOrderCard,
  type ShownNode,
} from '../../../domain/index.mjs';
import type { StackFoldStore } from '../../../store/index.mjs';
import { ExternalLink } from '../../common/index.mjs';
import { FoldedStack } from './folded-stack.js';
import { PullRequestCard } from './pull-request-card.js';
import { StackFoldToggle } from './stack-fold-toggle.js';

/**
 * One level of the tree, a row per pull request kept by number, so a read moves
 * the cards that moved and rebuilds only new ones. A pull request under several
 * predecessors is drawn in full once, and as one line elsewhere. What is below
 * a card can be folded into one row (spec §7.4).
 */
export const MergeOrderTree = ({
  nodes,
  depth,
  now,
  scaleMax,
  cards,
  fold,
}: Readonly<{
  nodes: InitializedObservable<readonly ShownNode[]>;
  depth: number;
  now: InitializedObservable<number>;
  scaleMax: InitializedObservable<number>;
  cards: InitializedObservable<ReadonlyMap<number, MergeOrderCard>>;
  fold: StackFoldStore;
}>): JSX.Element => (
  <ul class={constant(depth === 0 ? 'tree' : 'tree tree-children')}>
    <For
      items={nodes}
      key={(node) => `${node.card.number}${node.repeated ? '-repeated' : ''}`}
    >
      {(node$) => {
        const number = node$.pipe(map(({ card }) => card.number));

        const layers = node$
          .pipe(map((node) => layersBelow(foldNodeOf(node))))
          .pipe(skipIfNoChange(fastDeepEqual));

        const layerCount = layers.pipe(map((list) => list.length));

        // Folded only while there is something below to fold.
        const folded = combine([number, layerCount, fold.folded]).pipe(
          map(
            ([n, count, foldedNumbers]) =>
              count > 0 && foldedNumbers.includes(n),
          ),
        );

        return (
          <li>
            <If
              cond={node$.pipe(map(({ repeated }) => repeated))}
              then={
                <div class={constant('repeated')}>
                  <ExternalLink href={node$.pipe(map(({ card }) => card.url))}>
                    {node$.pipe(map(({ card }) => `#${card.number}`))}
                  </ExternalLink>
                  {constant(' — shown above')}
                </div>
              }
              else={
                <PullRequestCard
                  badgesEnd={
                    <If
                      cond={layerCount.pipe(map((count) => count > 0))}
                      then={
                        <StackFoldToggle
                          fold={fold}
                          folded={folded}
                          layers={layerCount}
                          number={number}
                        />
                      }
                    />
                  }
                  card={node$.pipe(map(({ card }) => card))}
                  now={now}
                  scaleMax={scaleMax}
                />
              }
            />
            <If
              cond={folded}
              then={
                <FoldedStack
                  cards={cards}
                  fold={fold}
                  layers={layers}
                  number={number}
                />
              }
              else={
                <If
                  cond={node$.pipe(
                    map(({ children }) => Arr.isNonEmpty(children)),
                  )}
                  then={
                    <MergeOrderTree
                      cards={cards}
                      depth={depth + 1}
                      fold={fold}
                      nodes={node$.pipe(map(({ children }) => children))}
                      now={now}
                      scaleMax={scaleMax}
                    />
                  }
                />
              }
            />
          </li>
        );
      }}
    </For>
  </ul>
);
