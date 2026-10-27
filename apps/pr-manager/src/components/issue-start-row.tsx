import {
  constant,
  For,
  If,
  mapBindable,
  MatchOptional,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { IssueStart } from '../issue-graph.mjs';
import type { IssueItem } from '../load-report.mjs';
import { ExternalLink } from './external-link.js';
import {
  describeNode,
  explainState,
  stateLabels,
} from './issue-dag-states.mjs';
import { separator } from './linked-issues.js';

type Props = Readonly<{
  issue: Bindable<IssueItem>;
  /** `undefined` until the graph has the issue. */
  start: Bindable<IssueStart | undefined>;
}>;

/**
 * How one listed issue stands for being started (`docs/issue-start-after.md`):
 * the state as a badge in the DAG's colours, what its `Start-After:` names,
 * each coloured by where it stands, and — a slip worth fixing — a
 * `Merge-After:` in its body, which an issue does not read.
 */
export const IssueStartRow = ({ issue, start }: Props): JSX.Element => (
  <div class={constant('pull-request-row')}>
    <MatchOptional
      value={mapBindable(start, (each) => Optional.fromNullable(each))}
      some={(some$) => (
        <>
          <span
            class={constant('badge issue-start')}
            data-state={view(some$, ({ state }) => state)}
            title={view(some$, ({ state }) =>
              explainState({ kind: 'issue', state }),
            )}
          >
            {view(some$, ({ state }) => stateLabels[state])}
          </span>

          <If
            cond={view(some$, ({ named }) => Arr.isNonEmpty(named))}
            then={
              <span class={constant('issue-start-named')}>
                {constant('after ')}
                <For
                  items={view(some$, ({ named }) => named)}
                  key={(node) => node.number}
                >
                  {(node$, index$) => (
                    <>
                      {view(index$, separator)}
                      <ExternalLink
                        dataState={view(node$, (node) => node.state)}
                        href={view(node$, (node) => node.url)}
                        title={view(node$, describeNode)}
                      >
                        {view(node$, (node) => `#${node.number}`)}
                      </ExternalLink>
                    </>
                  )}
                </For>
              </span>
            }
          />
        </>
      )}
    />

    <If
      cond={mapBindable(issue, ({ misplacedMergeAfter }) =>
        Arr.isNonEmpty(misplacedMergeAfter),
      )}
      then={
        <span
          class={constant('failed-checks')}
          title={constant(
            'An issue does not read Merge-After:, which orders pull requests. Write Start-After: to say what this issue waits for.',
          )}
        >
          {mapBindable(
            issue,
            ({ misplacedMergeAfter }) =>
              `Merge-After: ${misplacedMergeAfter.map((n) => `#${n}`).join(', ')} is not read here; use Start-After:`,
          )}
        </span>
      }
    />
  </div>
);
