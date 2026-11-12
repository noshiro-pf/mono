import { map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { ShownNode } from '../../../domain/index.mjs';
import { ExternalLink } from '../../common/index.mjs';
import { PullRequestCard } from './pull-request-card.js';

/**
 * One level of the tree, a row per pull request kept by number, so a read moves
 * the cards that moved and rebuilds only new ones. A pull request under several
 * predecessors is drawn in full once, and as one line elsewhere.
 */
export const MergeOrderTree = ({
  nodes,
  depth,
  now,
  scaleMax,
}: Readonly<{
  nodes: InitializedObservable<readonly ShownNode[]>;
  depth: number;
  now: InitializedObservable<number>;
  scaleMax: InitializedObservable<number>;
}>): JSX.Element => (
  <ul class={constant(depth === 0 ? 'tree' : 'tree tree-children')}>
    <For
      items={nodes}
      key={(node) => `${node.card.number}${node.repeated ? '-repeated' : ''}`}
    >
      {(node$) => (
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
                card={node$.pipe(map(({ card }) => card))}
                now={now}
                scaleMax={scaleMax}
              />
            }
          />
          <If
            cond={node$.pipe(map(({ children }) => Arr.isNonEmpty(children)))}
            then={
              <MergeOrderTree
                depth={depth + 1}
                nodes={node$.pipe(map(({ children }) => children))}
                now={now}
                scaleMax={scaleMax}
              />
            }
          />
        </li>
      )}
    </For>
  </ul>
);
