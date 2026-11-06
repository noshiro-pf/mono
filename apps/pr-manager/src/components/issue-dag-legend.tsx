import { map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import type { IssueGraph, IssueNodeState } from '../issue-graph.mjs';
import { isFadedTier, isRingedTier } from '../priority.mjs';
import { issuesViewStore } from '../store/index.mjs';
import { legendStates, stateLabels } from './issue-dag-states.mjs';

/**
 * What the colours and the shapes of the DAG mean — only those it draws, so the
 * key stays as short as the graph lets it.
 */
export const IssueDagLegend = (): JSX.Element => {
  const graph$ = issuesViewStore.graph;

  const has = (
    test: (graph: IssueGraph) => boolean,
  ): InitializedObservable<boolean> => graph$.pipe(map(test));

  return (
    <ul aria-label={constant('Key')} class={constant('issue-dag-legend')}>
      <If
        cond={has(({ nodes }) => nodes.some(({ kind }) => kind === 'issue'))}
        then={
          <li>
            <span
              class={constant('issue-dag-swatch')}
              data-shape={constant('issue')}
            />
            {constant('Issue')}
          </li>
        }
      />
      <If
        cond={has(({ nodes }) =>
          nodes.some(({ kind }) => kind === 'pull-request'),
        )}
        then={
          <li>
            <span
              class={constant('issue-dag-swatch')}
              data-shape={constant('pull-request')}
            />
            {constant('Pull request')}
          </li>
        }
      />
      <For items={graph$.pipe(map(keysOf))} key={(key) => key.id}>
        {(key$) => (
          <li>
            <span
              class={constant('issue-dag-swatch')}
              data-kind={key$.pipe(map(({ kind }) => kind))}
              data-state={key$.pipe(map(({ state }) => state))}
            />
            {key$.pipe(map(({ label }) => label))}
          </li>
        )}
      </For>
      <If
        cond={has(({ edges }) => edges.some(({ kind }) => kind === 'closes'))}
        then={
          <li>
            <span
              class={constant('issue-dag-swatch')}
              data-edge={constant('closes')}
            />
            {constant('Closed by')}
          </li>
        }
      />
      <If
        cond={has(({ nodes }) =>
          nodes.some(({ priority }) => isRingedTier(priority)),
        )}
        then={
          <li>
            <span
              class={constant('issue-dag-swatch')}
              data-priority={constant('S')}
            />
            {constant('Priority S or A')}
          </li>
        }
      />
      <If
        cond={has(({ nodes }) =>
          nodes.some(({ priority }) => isFadedTier(priority)),
        )}
        then={
          <li>
            <span
              class={constant('issue-dag-swatch')}
              data-priority={constant('D')}
            />
            {constant('Priority D, hold or close')}
          </li>
        }
      />
      <If
        cond={has(({ nodes }) => nodes.some(({ pending }) => pending))}
        then={
          <li>
            <span
              class={constant('issue-dag-swatch')}
              data-pending={constant('true')}
            />
            {constant('Pending pull request')}
          </li>
        }
      />
    </ul>
  );
};

type StateKey = Readonly<{
  id: string;
  state: IssueNodeState;
  kind: 'pull-request' | 'issue' | undefined;
  label: string;
}>;

/**
 * The states the graph draws, in the legend's order. An open pull request is
 * drawn as work under way and an open issue neutral, so `open` is keyed once
 * for each that is drawn.
 */
const keysOf = (graph: IssueGraph): readonly StateKey[] => {
  const states = new Set(graph.nodes.map(({ state }) => state));

  return legendStates
    .filter((state) => states.has(state))
    .flatMap((state): readonly StateKey[] =>
      state === 'open'
        ? (['pull-request', 'issue'] as const)
            .filter((kind) =>
              graph.nodes.some(
                (node) => node.state === 'open' && node.kind === kind,
              ),
            )
            .map((kind) => ({
              id: `open-${kind}`,
              state,
              kind,
              label: openLabels[kind],
            }))
        : [{ id: state, state, kind: undefined, label: stateLabels[state] }],
    );
};

const openLabels = {
  'pull-request': 'Open pull request',
  issue: 'Open, not listed yet',
} as const;
