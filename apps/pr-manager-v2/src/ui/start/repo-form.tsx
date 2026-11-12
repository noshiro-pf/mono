import { createState, map } from 'synstate';
import { constant, MatchOptional, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { parseRepo, type Repo } from '../../domain/index.mjs';
import './start.css';

type Props = Readonly<{
  /** Opens the page for another repository, keeping the rest of the query. */
  go: (repo: Repo) => void;
  /** What `?repo=` said when it named no repository, to show it back. */
  initial: string | undefined;
}>;

/**
 * Asks which repository to read: `owner/name`, or its address on github.com as
 * copied from the address bar. Every other query parameter goes along.
 */
export const RepoForm = ({ go, initial }: Props): JSX.Element => {
  const [typed, setTyped, { getSnapshot: getTyped }] = createState(
    initial ?? '',
  );

  const [error, setError] = createState<string | undefined>(
    initial === undefined
      ? undefined
      : `“${initial}” names no repository. Type owner/name.`,
  );

  return (
    <form
      class={constant('repo-form')}
      onSubmit={(event) => {
        event.preventDefault();

        const repo = parseRepo(getTyped());

        if (repo === undefined) {
          setError(`“${getTyped()}” names no repository. Type owner/name.`);

          return;
        }

        go(repo);
      }}
    >
      <label class={constant('repo-form-label')}>
        {constant('Repository')}
        <input
          autocomplete={constant('off')}
          placeholder={constant('owner/name or https://github.com/owner/name')}
          spellcheck={constant(false)}
          value={typed}
          onInput={(event) => {
            setTyped(event.currentTarget.value);

            setError(undefined);
          }}
        />
      </label>

      <button class={constant('button')} type={constant('submit')}>
        {constant('Open')}
      </button>

      <MatchOptional
        value={error.pipe(map(Optional.fromNullable))}
        some={(message) => (
          <p class={constant('repo-form-error')} role={constant('alert')}>
            {message}
          </p>
        )}
      />
    </form>
  );
};
