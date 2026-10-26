import { createState } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { ExternalLink } from './external-link.js';
import { followOpen } from './follow-open.mjs';

/**
 * The "How to use" button and the dialog it opens: what a repository writes
 * for the page to say more — the `Merge-After:` and `Start-After:` lines and
 * the labels it reads — and a link to the README, which says the rest.
 *
 * A summary of the README's "What your repository can add", kept to the
 * rules a reader acts on while looking at the page; the README stays the
 * whole of it. `unblock-prs` is left out until its own conventions settle.
 *
 * A native `<dialog>` opened modal, as the other header dialogs are
 * (`view-settings.tsx`). Nothing else reads whether it is open, so the state
 * is the component's own rather than a store's. It needs no token: it is
 * what a reader who has not given one yet may want first. The README link
 * is the first thing in it, because opening focuses the first control: one
 * at the bottom would open the dialog scrolled to its end.
 */
export const HowToUse = (): JSX.Element => {
  const [open$, setOpen] = createState(false);

  const openDialog = (): void => {
    setOpen(true);
  };

  const closeDialog = (): void => {
    setOpen(false);
  };

  return (
    <>
      <button
        class={constant('header-button')}
        title={constant(
          'What the page reads from descriptions and labels, and where to read more',
        )}
        type={constant('button')}
        onClick={openDialog}
      >
        {constant('How to use')}
      </button>

      <dialog
        ref={followOpen(open$)}
        aria-labelledby={constant(TITLE_ID)}
        class={constant('view-settings how-to-use')}
        onClose={closeDialog}
      >
        <h2 class={constant('view-settings-title')} id={constant(TITLE_ID)}>
          {constant('How to use')}
        </h2>

        <p class={constant('how-to-use-lead')}>
          {constant(
            'The page works on any repository as it is. A few optional conventions make it say more; ',
          )}
          <ExternalLink href={constant(README_URL)}>
            {constant('the README')}
          </ExternalLink>
          {constant(' says the rest.')}
        </p>

        <section class={constant('how-to-use-section')}>
          <h3 class={constant('how-to-use-heading')}>
            {constant('Merge order: ')}
            <code>{constant('Merge-After:')}</code>
          </h3>

          <ul class={constant('how-to-use-list')}>
            <li>
              {constant('Write ')}
              <code>{constant('Merge-After: #12')}</code>
              {constant(
                ' on a line of a pull request’s description, and the merge order draws it under #12. ',
              )}
              <code>{constant('Merge-After: #12, #15')}</code>
              {constant(
                ' names several, and so do several such lines; it waits for all of them.',
              )}
            </li>
            <li>
              {constant(
                'The line may be anywhere in the description, in any case. Inside a fenced code block it is an example and is not read.',
              )}
            </li>
            <li>
              {constant('Only ')}
              <code>{constant('#N')}</code>
              {constant(' is read: ')}
              <code>{constant('owner/repo#N')}</code>
              {constant(
                ' is not, even when it names this repository. A number that is not an open pull request holds nothing.',
              )}
            </li>
            <li>
              {constant(
                'A pull request opened onto another’s branch is drawn under it as “stacked on #N”, with or without the line.',
              )}
            </li>
            <li>
              {constant(
                'Pull requests that wait for each other in a loop are listed under “Merge-After cycles”.',
              )}
            </li>
          </ul>
        </section>

        <section class={constant('how-to-use-section')}>
          <h3 class={constant('how-to-use-heading')}>
            {constant('Issues: ')}
            <code>{constant('Start-After:')}</code>
          </h3>

          <ul class={constant('how-to-use-list')}>
            <li>
              <code>{constant('Start-After: #N')}</code>
              {constant(' on a line of an issue’s description, read as ')}
              <code>{constant('Merge-After:')}</code>
              {constant(
                ' is, or GitHub’s “blocked by”, draws the issue after #N in the DAG.',
              )}
            </li>
            <li>
              {constant(
                'A pull request that closes such an issue (“Closes #N”) inherits it: in the merge order it waits for the open pull requests named there, and for those closing the open issues named there.',
              )}
            </li>
            <li>
              {constant('An issue does not read ')}
              <code>{constant('Merge-After:')}</code>
              {constant(', which orders pull requests only.')}
            </li>
          </ul>
        </section>

        <section class={constant('how-to-use-section')}>
          <h3 class={constant('how-to-use-heading')}>{constant('Labels')}</h3>

          <ul class={constant('how-to-use-list')}>
            <li>
              <code>{constant('priority:high')}</code>
              {constant(', ')}
              <code>{constant('priority:mid')}</code>
              {constant(', ')}
              <code>{constant('priority:low')}</code>
              {constant(
                ': the merge order and the issues filter and sort by it. One carrying none, or more than one, has no priority.',
              )}
            </li>
            <li>
              <code>{constant('pending')}</code>
              {constant(
                ': counted as held back, and the pending switches hide it.',
              )}
            </li>
          </ul>
        </section>

        <section class={constant('how-to-use-section')}>
          <h3 class={constant('how-to-use-heading')}>
            {constant('Repository settings')}
          </h3>

          <ul class={constant('how-to-use-list')}>
            <li>
              {constant(
                'Required status checks in a ruleset or branch protection rule: the checks are judged by those alone, not by every check.',
              )}
            </li>
            <li>
              {constant(
                'A ruleset asking for code owner review, and a CODEOWNERS file: the page shows which pull requests wait for a code owner.',
              )}
            </li>
          </ul>
        </section>

        <div class={constant('view-settings-actions how-to-use-actions')}>
          <button
            class={constant('header-button')}
            type={constant('button')}
            onClick={closeDialog}
          >
            {constant('Done')}
          </button>
        </div>
      </dialog>
    </>
  );
};

/** The app's README on the default branch, which this dialog summarizes. */
const README_URL =
  'https://github.com/noshiro-pf/mono/blob/main/apps/pr-manager-app/README.md';

const TITLE_ID = 'how-to-use-title';
