import * as React from 'react';
import { Arr } from 'ts-data-forge';

type Props = Readonly<{
  repoUrl: string;
  cycles: readonly (readonly number[])[];
}>;

/**
 * The pull requests that wait, in the end, for themselves.
 *
 * Named rather than drawn: there is no position in a merge order to draw them
 * at, which is why they are absent from the tree above.
 */
export const CyclesSection = ({
  repoUrl,
  cycles,
}: Props): React.ReactElement => (
  <section className={'section'}>
    <h2 className={'section-title'}>{'Merge-After cycles'}</h2>
    <p className={'section-note'}>
      {'Each of these waits, in the end, for itself. Nothing can pick them up'}
      {'until one of the declarations goes.'}
    </p>
    <ul>
      {cycles.map((cycle) =>
        Arr.isNonEmpty(cycle) ? (
          <li key={cycle.join('-')}>
            {cycle.map((number, index) => (
              <React.Fragment key={number}>
                {index === 0 ? '' : ' → '}
                <a href={`${repoUrl}/pull/${number}`}>{`#${number}`}</a>
              </React.Fragment>
            ))}
            {' → back to '}
            <a href={`${repoUrl}/pull/${cycle[0]}`}>{`#${cycle[0]}`}</a>
          </li>
        ) : undefined,
      )}
    </ul>
  </section>
);
