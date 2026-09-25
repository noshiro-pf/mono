import * as React from 'react';
import { POLL_INTERVAL_MS } from '../constants.mjs';
import { isRunningLow, type RateLimit } from '../rate-limit.mjs';
import { type StoredToken } from '../token.mjs';
import { ExternalLink } from './external-link.js';

type Props = Readonly<{
  token: StoredToken | undefined;
  rateLimit: RateLimit | undefined;
  /** What went wrong keeping it, if the browser refused to. */
  saveError: string | undefined;
  onSave: (token: StoredToken) => void;
  onForget: () => void;
}>;

/**
 * Where a reader gives the page a token, and — the part that matters more —
 * where they are told which one to make.
 *
 * Open until there is a token, because the page reads nothing without one,
 * and closed after, because then it has nothing left to ask. What is behind
 * it is the recipe and the reason for it: GraphQL answers nobody without a
 * token, but reading a public repository needs no permission at all, so the
 * token this page wants is the weakest GitHub can mint. Saying so is what
 * keeps a reader from reaching for `repo` because it sounded like the one
 * that works.
 */
export const TokenPanel = React.memo<Props>((props) => {
  const { token, rateLimit, saveError, onSave, onForget } = props;

  const [typed, setTyped] = React.useState('');

  const [remember, setRemember] = React.useState(false);

  const onTypedChange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((changed) => {
    setTyped(changed.target.value);
  }, []);

  const onRememberChange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((changed) => {
    setRemember(changed.target.checked);
  }, []);

  const onSubmit = React.useCallback<React.SubmitEventHandler<HTMLFormElement>>(
    (submitted) => {
      // The page has nowhere to submit to — `form-action 'none'` in the
      // policy says as much — and the element is a form so that Enter
      // submits it.
      submitted.preventDefault();

      const trimmed = typed.trim();

      if (trimmed === '') return;

      onSave({ value: trimmed, store: remember ? 'device' : 'session' });

      setTyped('');
    },
    [onSave, remember, typed],
  );

  const onClear = React.useCallback((): void => {
    setTyped('');

    onForget();
  }, [onForget]);

  // Said in the sentence as well as shown in the colour: the reserved status
  // steps are not allowed to carry a meaning on their own here, and a reader
  // who cannot tell the two greys apart still has to learn that the page is
  // about to stop being able to look.
  const low = rateLimit !== undefined && isRunningLow(rateLimit);

  return (
    <details className={'token-panel'} open={token === undefined}>
      <summary className={'token-summary'}>
        {token === undefined ? 'A token is needed' : 'Reading with a token'}
      </summary>

      <div className={'token-body'}>
        <p className={low ? 'token-state token-state-low' : 'token-state'}>
          {token === undefined
            ? 'Nothing is read until there is one.'
            : `Held ${token.store === 'device' ? 'on this device' : 'in this tab only'}. ${limitWords(rateLimit)} Reading every ${seconds(POLL_INTERVAL_MS)} while this tab is visible.${low ? RUNNING_LOW : ''}`}
        </p>

        <form className={'token-form'} onSubmit={onSubmit}>
          <label className={'token-field'} htmlFor={INPUT_ID}>
            {'GitHub personal access token'}
          </label>

          <input
            autoComplete={'off'}
            className={'token-input'}
            id={INPUT_ID}
            placeholder={
              token === undefined ? 'ghp_… or github_pat_…' : '••••••••'
            }
            spellCheck={false}
            type={'password'}
            value={typed}
            onChange={onTypedChange}
          />

          <label className={'token-remember'} htmlFor={REMEMBER_ID}>
            <input
              checked={remember}
              id={REMEMBER_ID}
              type={'checkbox'}
              onChange={onRememberChange}
            />

            {'Remember on this device'}
          </label>

          <div className={'token-actions'}>
            <button className={'token-use'} type={'submit'}>
              {'Use this token'}
            </button>

            <button className={'token-clear'} type={'button'} onClick={onClear}>
              {'Clear'}
            </button>
          </div>
        </form>

        {saveError === undefined ? undefined : (
          <p className={'token-error'}>{saveError}</p>
        )}

        <TokenHelp />
      </div>
    </details>
  );
});

TokenPanel.displayName = 'TokenPanel';

const INPUT_ID = 'github-token';

const REMEMBER_ID = 'github-token-remember';

/**
 * What GitHub allows, said before it has answered for the first time. Only
 * the fallback: the numbers on screen after that are GitHub's own.
 */
const GRAPHQL_LIMIT = 5000;

/**
 * The budget belongs to the token's account, so anything else that account
 * does with GraphQL spends it too.
 */
const RUNNING_LOW =
  ' Running low — the budget is shared with everything else this account does with GraphQL, and it resets within the hour.';

const MS_PER_SECOND = 1000;

const SECONDS_PER_MINUTE = 60;

/**
 * What GitHub last said is left, or what it would be if it has not answered
 * yet. The fallback is the documented size of the window rather than a blank,
 * so the sentence reads the same before the first answer arrives.
 */
const limitWords = (rateLimit: RateLimit | undefined): string =>
  rateLimit === undefined
    ? (`${GRAPHQL_LIMIT.toLocaleString('en')} GraphQL points an hour.` as const)
    : (`${rateLimit.remaining.toLocaleString('en')} of ${rateLimit.limit.toLocaleString('en')} GraphQL points left this hour.` as const);

const seconds = (ms: number): string => {
  const total = ms / MS_PER_SECOND;

  return total < SECONDS_PER_MINUTE
    ? `${total} seconds`
    : `${total / SECONDS_PER_MINUTE} minutes`;
};

/**
 * The permissions, in the form of the two token pages a reader would open.
 *
 * Deliberately specific. "Read-only access" is the kind of instruction that
 * gets read as `repo` on the classic page, which is write access to every
 * private repository the account can see — so the classic recipe here is
 * *tick nothing*, in those words, with GitHub's own sentence about what that
 * grants.
 */
const TokenHelp = React.memo(() => (
  <details className={'token-help'}>
    <summary>{'Which token, and with what permissions?'}</summary>

    <p>
      {
        'This page asks GitHub’s GraphQL API about the pull requests of a public repository, and nothing else. GraphQL answers nobody without a token, but reading a public repository needs no permission you do not already have as a stranger. So the right token here is the weakest one you can make.'
      }
    </p>

    <h4>{'Simplest: a classic token with nothing ticked'}</h4>

    <ol>
      <li>
        <ExternalLink href={'https://github.com/settings/tokens/new'}>
          {
            'Settings → Developer settings → Personal access tokens (classic) → Generate new token'
          }
        </ExternalLink>
      </li>

      <li>{'Give it a note, and an expiry — the shortest that suits you.'}</li>

      <li>
        <strong>{'Tick no scopes at all.'}</strong>{' '}
        {
          'In GitHub’s words, “a token with no assigned scopes can only access public information”. It cannot read a private repository, write anything, or act as you. Lost, it is worth one thing: somebody else’s share of your rate limit.'
        }
      </li>
    </ol>

    <h4>{'Or: a fine-grained token that reads public repositories'}</h4>

    <ol>
      <li>
        <ExternalLink
          href={'https://github.com/settings/personal-access-tokens/new'}
        >
          {
            'Settings → Developer settings → Fine-grained personal access tokens → Generate new token'
          }
        </ExternalLink>
      </li>

      <li>
        {'Repository access: '}
        <strong>{'Public repositories'}</strong>
        {
          '. That is read-only access to what anyone can already see, and no permissions need adding to it.'
        }
      </li>
    </ol>

    <h4>{'Where it is kept'}</h4>

    <p>
      {
        'By default, in this tab only: it is gone when the tab closes. “Remember on this device” moves it to storage that survives the browser being shut — which on GitHub Pages is shared by every app published under noshiro-pf.github.io, so it is worth the shorter expiry if you tick it.'
      }
    </p>

    <p>
      {
        'It is sent to api.github.com and nowhere else. The page’s Content-Security-Policy allows no other connection, so that is a property of the page rather than a promise about its code.'
      }
    </p>
  </details>
));

TokenHelp.displayName = 'TokenHelp';
