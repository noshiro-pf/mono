import { memoNamed } from 'preact-utils';
import type { IssueGraph } from '../issue-graph.mjs';
import { legendStates, stateLabels } from './issue-dag-states.mjs';

type Props = Readonly<{ graph: IssueGraph }>;

/**
 * What the colours and the shapes of the DAG mean — only those it draws,
 * so the key stays as short as the graph lets it.
 */
export const IssueDagLegend = memoNamed<Props>(
  'IssueDagLegend',
  ({ graph }) => {
    const states = new Set(graph.nodes.map(({ state }) => state));

    const kinds = new Set(graph.nodes.map(({ kind }) => kind));

    const closes = graph.edges.some(({ kind }) => kind === 'closes');

    const priorities = new Set(graph.nodes.map(({ priority }) => priority));

    // An open pull request is drawn as work under way and an open issue
    // neutral, so `open` is keyed once for each that is drawn.
    const openKinds = (['pull-request', 'issue'] as const).filter((kind) =>
      graph.nodes.some((node) => node.state === 'open' && node.kind === kind),
    );

    return (
      <ul aria-label={'Key'} className={'issue-dag-legend'}>
        {kinds.has('issue') ? (
          <li>
            <span className={'issue-dag-swatch'} data-shape={'issue'} />
            {'Issue'}
          </li>
        ) : undefined}
        {kinds.has('pull-request') ? (
          <li>
            <span className={'issue-dag-swatch'} data-shape={'pull-request'} />
            {'Pull request'}
          </li>
        ) : undefined}
        {legendStates
          .filter((state) => states.has(state))
          .flatMap((state) =>
            state === 'open'
              ? openKinds.map((kind) => (
                  <li key={`open-${kind}`}>
                    <span
                      className={'issue-dag-swatch'}
                      data-kind={kind}
                      data-state={state}
                    />
                    {openLabels[kind]}
                  </li>
                ))
              : [
                  <li key={state}>
                    <span className={'issue-dag-swatch'} data-state={state} />
                    {stateLabels[state]}
                  </li>,
                ],
          )}
        {closes ? (
          <li>
            <span className={'issue-dag-swatch'} data-edge={'closes'} />
            {'Closed by'}
          </li>
        ) : undefined}
        {priorities.has('high') ? (
          <li>
            <span className={'issue-dag-swatch'} data-priority={'high'} />
            {'High priority'}
          </li>
        ) : undefined}
        {priorities.has('low') ? (
          <li>
            <span className={'issue-dag-swatch'} data-priority={'low'} />
            {'Low priority'}
          </li>
        ) : undefined}
      </ul>
    );
  },
);

const openLabels = {
  'pull-request': 'Open pull request',
  issue: 'Open, not listed yet',
} as const;
