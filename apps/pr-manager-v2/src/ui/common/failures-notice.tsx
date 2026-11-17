import type { ReadError } from 'pr-report-core-v2';
import { map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { countOf, failureLines } from '../../domain/index.mjs';
import './common.css';

/**
 * What a read could not get, said in the block drawn from it while the block
 * draws the last answers it had (spec §4.1); nothing when all was read. One
 * line under the block's title, each failure once in a list it opens, so that a
 * part failing for every pull request does not push the block off screen.
 */
export const FailuresNotice = ({
  failures,
}: Readonly<{
  failures: InitializedObservable<readonly ReadError[]>;
}>): JSX.Element => {
  const lines = failures.pipe(map(failureLines));

  return (
    <If
      cond={lines.pipe(map(Arr.isNonEmpty))}
      then={
        <details class={constant('notice failures-notice')}>
          <summary>
            {lines.pipe(
              map(
                (list) =>
                  `Drawn from the last answers: this read could not get ${countOf(list.length, 'thing')}.`,
              ),
            )}
          </summary>
          <ul>
            <For items={lines} key={(line) => line}>
              {(line$) => <li>{line$}</li>}
            </For>
          </ul>
        </details>
      }
    />
  );
};
