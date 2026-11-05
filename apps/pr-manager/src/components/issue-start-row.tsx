import { map } from 'synstate';
import {
  constant,
  For,
  If,
  inlineMap,
  mapBindable,
  MatchOptional,
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
  markedNote,
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
            data-state={inlineMap(some$, ({ state }) => state)}
            title={inlineMap(some$, ({ state, marked }) =>
              Arr.toUnshifted(explainState({ kind: 'issue', state, marked }))(
                markedNote({ state, marked }),
              ).join('\n'),
            )}
          >
            {inlineMap(some$, ({ state }) => stateLabels[state])}
          </span>

          <If
            cond={some$.pipe(map(({ named }) => Arr.isNonEmpty(named)))}
            then={
              <span class={constant('issue-start-named')}>
                {constant('after ')}
                <For
                  items={some$.pipe(map(({ named }) => named))}
                  key={(node) => node.number}
                >
                  {(node$, index$) => (
                    <>
                      {inlineMap(index$, separator)}
                      <ExternalLink
                        dataState={node$.pipe(map((node) => node.state))}
                        href={node$.pipe(map((node) => node.url))}
                        title={node$.pipe(map(describeNode))}
                      >
                        {inlineMap(node$, (node) => `#${node.number}`)}
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
