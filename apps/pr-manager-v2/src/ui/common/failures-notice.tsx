import type { ReadError } from 'pr-report-core-v2';
import { map, type InitializedObservable } from 'synstate';
import { If, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { Notice } from './notice.js';

/**
 * What a read could not get, said in the block drawn from it while the block
 * draws the last answers it had (spec §4.1); nothing when all was read.
 */
export const FailuresNotice = ({
  failures,
}: Readonly<{
  failures: InitializedObservable<readonly ReadError[]>;
}>): JSX.Element => (
  <If
    cond={failures.pipe(map(Arr.isNonEmpty))}
    then={
      <Notice>
        {failures.pipe(
          map((list) =>
            Arr.toUnshifted(
              'Drawn from the last answers for what this read could not get:',
            )(list.map(({ what, message }) => `${what} (${message})`)).join(
              ' ',
            ),
          ),
        )}
      </Notice>
    }
  />
);
