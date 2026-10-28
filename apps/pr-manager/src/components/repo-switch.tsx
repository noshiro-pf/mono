import { constant, type JSX } from 'synstate-dom';
import { RepoForm } from '../start/index.mjs';
import { reportSource } from '../store/index.mjs';

/**
 * Where a reader points the page at another repository, beside the name of
 * the one it reads. The form is {@link RepoForm}, the one the start page asks
 * with.
 *
 * Closed until asked for, because a reader changes it seldom and the header
 * is where the report's own state is.
 */
export const RepoSwitch = (): JSX.Element => (
  <details class={constant('repo-switch')}>
    <summary class={constant('repo-switch-summary')}>
      {constant('change')}
    </summary>

    <RepoForm initial={`${reportSource.owner}/${reportSource.repo}`} />
  </details>
);
