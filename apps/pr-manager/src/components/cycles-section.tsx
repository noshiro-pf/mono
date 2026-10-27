import {
  constant,
  For,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { repositoryUrl } from '../constants.mjs';
import { reader, reportSource } from '../store/index.mjs';
import { ExternalLink } from './external-link.js';

/**
 * The pull requests that wait, in the end, for themselves.
 *
 * Named rather than drawn: there is no position in a merge order to draw them
 * at, which is why they are absent from the tree above.
 */
export const CyclesSection = (): JSX.Element => (
  <section class={constant('section')}>
    <h2 class={constant('section-title')}>{constant('Merge-After cycles')}</h2>
    <p class={constant('section-note')}>
      {constant(
        'Each of these waits, in the end, for itself. Nothing can pick them up until one of the declarations goes.',
      )}
    </p>
    <ul>
      <For
        items={view(reader.cycles, (cycles) => cycles.filter(Arr.isNonEmpty))}
        key={(cycle) => cycle.join('-')}
      >
        {(cycle$) => (
          <li>
            <For items={cycle$} key={(prNumber) => prNumber}>
              {(prNumber$, index$) => (
                <>
                  {view(index$, (index) => (index === 0 ? '' : ' → '))}
                  <PullRequestLink prNumber={prNumber$} />
                </>
              )}
            </For>
            {constant(' → back to ')}
            <PullRequestLink prNumber={view(cycle$, ([first]) => first)} />
          </li>
        )}
      </For>
    </ul>
  </section>
);

const PullRequestLink = ({
  prNumber,
}: Readonly<{ prNumber: Bindable<number> }>): JSX.Element => (
  <ExternalLink href={mapBindable(prNumber, (n) => `${REPO_URL}/pull/${n}`)}>
    {mapBindable(prNumber, (n) => `#${n}`)}
  </ExternalLink>
);

const REPO_URL = repositoryUrl(reportSource);
