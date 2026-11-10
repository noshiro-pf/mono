import { createState } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { ExternalLink, followOpen } from '../common/index.mjs';

/**
 * **How to use** (spec §5): the conventions a repository can write for the page
 * to say more, and where to read the rest. Works without a token. The
 * README link comes first, since opening focuses the first control.
 */
export const HowToUse = (): JSX.Element => {
  const [open, setOpen] = createState(false);

  return (
    <>
      <button
        class={constant('button')}
        title={constant('What the page reads from descriptions and labels')}
        type={constant('button')}
        onClick={() => {
          setOpen(true);
        }}
      >
        {constant('How to use')}
      </button>

      <dialog
        ref={followOpen(open)}
        aria-labelledby={constant('how-to-use-title')}
        class={constant('dialog')}
        onClose={() => {
          setOpen(false);
        }}
      >
        <h2 id={constant('how-to-use-title')}>{constant('How to use')}</h2>

        <p>
          {constant(
            'The page works on any repository as it is. These optional conventions make it say more; ',
          )}
          <ExternalLink href={constant(README_URL)}>
            {constant('the README')}
          </ExternalLink>
          {constant(' has the rest.')}
        </p>

        <dl class={constant('how-to-use')}>
          {ROWS.map(([write, does]) => (
            <>
              <dt>
                <code>{constant(write)}</code>
              </dt>
              <dd>{constant(does)}</dd>
            </>
          ))}
        </dl>

        <h3>{constant('With a merge queue')}</h3>

        <p>
          {constant(
            'On a repository with a merge-queued label the page also draws the queue pr-merge-queue works through. Install the package, create the labels merge-queued, skip-ci and auto-rebase, open pull requests with npx open-pr, and leave npx unblock-prs running; ',
          )}
          <ExternalLink href={constant(QUEUE_README_URL)}>
            {constant('its README')}
          </ExternalLink>
          {constant(' has each step.')}
        </p>

        <form method={constant('dialog')}>
          <button class={constant('button')} type={constant('submit')}>
            {constant('Done')}
          </button>
        </form>
      </dialog>
    </>
  );
};

const README_URL =
  'https://github.com/noshiro-pf/mono/tree/main/apps/pr-manager#readme';

const QUEUE_README_URL =
  'https://github.com/noshiro-pf/mono/tree/main/libs/pr-merge-queue#readme';

const ROWS = [
  [
    'Merge-After: #12',
    'on a line of a pull request’s description draws it under #12 in the merge order.',
  ],
  [
    'Start-After: #12',
    'on a line of an issue’s description, or GitHub’s “blocked by”, draws the issue after #12 in the DAG.',
  ],
  [
    'priority:high | mid | low',
    'on a pull request filters and sorts the merge order.',
  ],
  [
    'priority:S … D | hold | close',
    'on an issue filters and sorts the issues, and marks it in the DAG.',
  ],
  [
    'pending',
    'on a pull request counts it as held back, to hide or show alone.',
  ],
  [
    'required status checks',
    'in a ruleset or branch protection judge the checks by those alone.',
  ],
  [
    'CODEOWNERS',
    'with a ruleset asking for code owner review shows what waits for a code owner.',
  ],
  [
    '# enforced-by: <check>',
    'in the comments heading CODEOWNERS says that required check enforces the file instead of the ruleset, which counts an author as approving what they own.',
  ],
] as const;
