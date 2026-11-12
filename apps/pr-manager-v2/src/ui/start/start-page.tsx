import { constant, type JSX } from 'synstate-dom';
import type { Repo } from '../../domain/index.mjs';
import '../tokens.css';
import { RepoForm } from './repo-form.js';
import './start.css';

type Props = Readonly<{
  invalid: string | undefined;
  /** Opens the page for another repository, keeping the rest of the query. */
  go: (repo: Repo) => void;
}>;

/**
 * What the page shows without `?repo=` naming a repository (spec §2): what it
 * is, and a form asking which repository to read. Nothing is read, and no store
 * is made: a repository read by default would be someone's own, open to a
 * reader who never chose it.
 */
export const StartPage = ({ invalid, go }: Props): JSX.Element => (
  <main class={constant('start-page')}>
    <h1>{constant('GitHub Pull Requests Manager')}</h1>

    <p class={constant('start-lead')}>
      {constant(
        'Where every open pull request of a repository stands, and what it waits for: the merge order, the checks, the queue, and the open issues as a graph. It only reads, from your browser, with a token you give it.',
      )}
    </p>

    <RepoForm go={go} initial={invalid} />

    <p class={constant('muted')}>
      {constant('The address it opens is the one to bookmark.')}
    </p>
  </main>
);
