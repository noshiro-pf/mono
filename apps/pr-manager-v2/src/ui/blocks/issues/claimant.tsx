import { map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { IssueClaimView } from '../../../domain/index.mjs';
import { Age, ExternalLink } from '../../common/index.mjs';

/**
 * Who claimed an issue with `start-issue`, and how long ago (#3233): a Claude
 * Code session opens; a `started` claim older than a day stands out.
 */
export const Claimant = ({
  claim,
  now,
}: Readonly<{
  claim: InitializedObservable<IssueClaimView | undefined>;
  now: InitializedObservable<number>;
}>): JSX.Element => (
  <span
    class={constant('badge claimant')}
    data-stale={claim.pipe(map((c) => (c?.stale === true ? 'true' : 'false')))}
    data-tone={claim.pipe(map((c) => (c?.stale === true ? 'serious' : 'info')))}
    title={claim.pipe(
      map((c) =>
        c === undefined
          ? ''
          : Arr.toUnshifted(
              `${c.state === 'started' ? 'Started' : 'Planned'} by ${c.by}.`,
            )(
              c.stale
                ? ['Started more than a day ago: the session may have stopped.']
                : [],
            ).join(' '),
      ),
    )}
  >
    <span aria-hidden={constant('true')}>
      {claim.pipe(map((c) => (c?.stale === true ? '⚠' : '✋')))}
    </span>
    {claim.pipe(map((c) => (c?.state === 'started' ? 'started ' : 'planned ')))}
    <If
      cond={claim.pipe(map((c) => c?.sessionUrl !== undefined))}
      then={
        <ExternalLink href={claim.pipe(map((c) => c?.sessionUrl ?? ''))}>
          {constant('by a session')}
        </ExternalLink>
      }
      else={<span>{claim.pipe(map((c) => `by ${c?.by ?? ''}`))}</span>}
    />
    <Age at={claim.pipe(map((c) => c?.atMs ?? 0))} now={now} prefix={' '} />
  </span>
);
