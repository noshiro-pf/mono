import { createState } from 'synstate';
import { constant, MatchOptional, view, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { parseRepository, searchWithRepository } from '../constants.mjs';
import { reportSource } from '../store/index.mjs';
import { navigateToSearch } from '../url.mjs';

/**
 * Where a reader points the page at another repository, beside the name of
 * the one it reads: `owner/name`, or its address on GitHub as the address bar
 * has it.
 *
 * What it does is write `?repo=` and open the page there, the layout and the
 * theme kept. The page reads the repository once, as it opens
 * (`reportSourceFromSearch`), so a read still out for the one before cannot
 * land on the page of the next, and a bookmark of it opens the same one.
 *
 * Closed until asked for, because a reader changes it seldom and the header
 * is where the report's own state is.
 */
export const RepoSwitch = (): JSX.Element => {
  const [error, setError] = createState<string | undefined>(undefined);

  return (
    <details class={constant('repo-switch')}>
      <summary class={constant('repo-switch-summary')}>
        {constant('change')}
      </summary>

      <form
        class={constant('repo-switch-form')}
        onSubmit={(submitted) => {
          // Enter submits; nothing is sent anywhere (`form-action 'none'`).
          submitted.preventDefault();

          const field = submitted.currentTarget.elements.namedItem(INPUT_NAME);

          const value = field instanceof HTMLInputElement ? field.value : '';

          const source = parseRepository(value);

          if (source === undefined) {
            setError(
              'Name a repository on github.com, as owner/name or as its address.',
            );

            return;
          }

          setError(undefined);

          navigateToSearch((search) => searchWithRepository(search, source));
        }}
      >
        <label
          class={constant('repo-switch-label')}
          htmlFor={constant(INPUT_ID)}
        >
          {constant('Repository')}
        </label>

        <input
          autocomplete={constant('off')}
          class={constant('repo-switch-input')}
          id={constant(INPUT_ID)}
          name={constant(INPUT_NAME)}
          placeholder={constant('owner/name or https://github.com/owner/name')}
          type={constant('text')}
          value={constant(`${reportSource.owner}/${reportSource.repo}`)}
        />

        <button class={constant('repo-switch-open')} type={constant('submit')}>
          {constant('Open')}
        </button>
      </form>

      <MatchOptional
        value={view(error, Optional.fromNullable)}
        some={(error$) => (
          <p class={constant('repo-switch-error')} role={constant('alert')}>
            {error$}
          </p>
        )}
      />

      <p class={constant('repo-switch-note')}>
        {constant(
          'A public repository is read with any token. A private one needs a token that can read it.',
        )}
      </p>
    </details>
  );
};

const INPUT_ID = 'repository';

const INPUT_NAME = 'repository';
