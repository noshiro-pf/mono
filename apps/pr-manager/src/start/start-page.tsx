import { constant, type JSX } from 'synstate-dom';
import { NOT_A_REPOSITORY, RepoForm } from './repo-form.js';

type Props = Readonly<{
  /** `?repo=` as written, when it names no repository. */
  invalid: string | undefined;
}>;

/**
 * What the page shows when the URL names no repository: the question of
 * which one to read, and nothing else.
 *
 * The page reads no repository it was not pointed at. One read by default
 * would be someone's own, and a reader who never chose it could act on it
 * from here — file an issue, follow a pull request — without noticing whose
 * it is.
 */
export const StartPage = ({ invalid }: Props): JSX.Element => (
  <main class={constant('page start-page')}>
    <h1 class={constant('page-title')}>{constant(TITLE)}</h1>

    <p class={constant('start-page-lead')}>
      {constant(
        'Where every open pull request of a repository stands, and what it waits for. Name the repository to read; the address it opens is the one to bookmark.',
      )}
    </p>

    <RepoForm
      initial={invalid ?? ''}
      {...(invalid === undefined
        ? {}
        : {
            initialError: `“${invalid}” is not a repository. ${NOT_A_REPOSITORY}`,
          })}
    />

    <p class={constant('start-page-more')}>
      <a href={constant(README_URL)} rel={constant('noreferrer')}>
        {constant('How the page works, and what a repository can add')}
      </a>
    </p>
  </main>
);

const TITLE = 'GitHub Pull Requests Manager';

const README_URL =
  'https://github.com/noshiro-pf/mono/blob/main/apps/pr-manager/README.md';
