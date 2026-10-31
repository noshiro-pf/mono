import { createState } from 'synstate';
import { constant, MatchOptional, view, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { parseRepository, searchWithRepository } from '../constants.mjs';
import { navigateToSearch } from '../url.mjs';

type Props = Readonly<{
  /** What the field holds as it is drawn. */
  initial: string;
  /** An error to show before anything is typed, such as a `?repo=` that names no repository. */
  initialError?: string;
}>;

/**
 * Where a reader names the repository to read: `owner/name`, or its address on
 * GitHub as the address bar has it.
 *
 * What it does is write `?repo=` and open the page there, the rest of the query
 * — the layout, the theme, the filters — kept. The page reads the repository
 * once, as it opens (`reportSourceFromSearch`), so a read still out for the one
 * before cannot land on the page of the next, and a bookmark of it opens the
 * same one.
 *
 * Outside `components/` because the start page draws it, and that page must not
 * load the store: the store reads the repository the URL names, and on the
 * start page there is none.
 */
export const RepoForm = ({ initial, initialError }: Props): JSX.Element => {
  const [error, setError] = createState<string | undefined>(initialError);

  return (
    <div class={constant('repo-form')}>
      <form
        class={constant('repo-switch-form')}
        onSubmit={(submitted) => {
          // Enter submits; nothing is sent anywhere (`form-action 'none'`).
          submitted.preventDefault();

          const field = submitted.currentTarget.elements.namedItem(INPUT_NAME);

          const value = field instanceof HTMLInputElement ? field.value : '';

          const source = parseRepository(value);

          if (source === undefined) {
            setError(NOT_A_REPOSITORY);

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
          value={constant(initial)}
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
    </div>
  );
};

export const NOT_A_REPOSITORY =
  'Name a repository on github.com, as owner/name or as its address.';

const INPUT_ID = 'repository';

const INPUT_NAME = 'repository';
