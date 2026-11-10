import { constant, type JSX } from 'synstate-dom';
import type { Repo } from '../../domain/index.mjs';
import { RepoForm } from '../start/index.mjs';

type Props = Readonly<{ go: (repo: Repo) => void }>;

/**
 * **change** beside the repository's name: a small disclosure with the start
 * page's form. Opening another repository is a navigation, so a read in flight
 * for this one never lands on that one's page.
 */
export const RepoSwitch = ({ go }: Props): JSX.Element => (
  <details class={constant('repo-switch')}>
    <summary>{constant('change')}</summary>

    <RepoForm go={go} initial={undefined} />
  </details>
);
