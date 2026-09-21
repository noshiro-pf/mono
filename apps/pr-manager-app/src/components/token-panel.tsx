import * as React from 'react';
import {
  ANONYMOUS_POLL_INTERVAL_MS,
  SIGNED_IN_POLL_INTERVAL_MS,
} from '../constants.mjs';
import { type RateLimit } from '../rate-limit.mjs';
import { type StoredToken } from '../token.mjs';

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
 * Closed by default, because the page works without it and most readers will
 * never open it. What is behind it is two recipes and the reason there are
 * two: the token this page wants is the weakest GitHub can mint, since the
 * rate limit it is here for is charged to the account rather than to
 * anything the token is allowed to reach. Asking for a token with no
 * permissions is not a way of being careful with somebody else's account, it
 * is the correct token for the job, and saying so is what keeps a reader
 * from reaching for `repo` because it sounded like the one that works.
 */
export const TokenPanel = ({
  token,
  rateLimit,
  saveError,
  onSave,
  onForget,
}: Props): React.ReactElement => {
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

  return (
    <details className={'token-panel'}>
      <summary className={'token-summary'}>
        {token === undefined
          ? 'Reading without a token'
          : 'Reading with a token'}
      </summary>

      <div className={'token-body'}>
        <p className={'token-state'}>
          {token === undefined
            ? `${limitWords(rateLimit, 60)} Checking every ${seconds(ANONYMOUS_POLL_INTERVAL_MS)}.`
            : `Held ${token.store === 'device' ? 'on this device' : 'in this tab only'}. ${limitWords(rateLimit, 5000)} Checking every ${seconds(SIGNED_IN_POLL_INTERVAL_MS)}.`}
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
};

const INPUT_ID = 'github-token';

const REMEMBER_ID = 'github-token-remember';

const MS_PER_SECOND = 1000;

const SECONDS_PER_MINUTE = 60;

/**
 * What GitHub last said is left, or what it would be if it has not answered
 * yet. The fallback is the documented size of the window rather than a blank,
 * so the sentence reads the same before the first answer arrives.
 */
const limitWords = (
  rateLimit: RateLimit | undefined,
  fallbackLimit: number,
): string =>
  rateLimit === undefined
    ? `${fallbackLimit.toLocaleString('en')} requests an hour.`
    : `${rateLimit.remaining.toLocaleString('en')} of ${rateLimit.limit.toLocaleString('en')} requests left this hour.`;

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
const TokenHelp = (): React.ReactElement => (
  <details className={'token-help'}>
    <summary>{'Which token, and with what permissions?'}</summary>

    <p>
      {
        'This page reads two issues of a public repository and nothing else. It needs no permission you do not already have as a stranger — what it needs is the higher rate limit, and GitHub charges that to the account rather than to what the token is allowed to reach. So the right token here is the weakest one you can make.'
      }
    </p>

    <h4>{'Simplest: a classic token with nothing ticked'}</h4>

    <ol>
      <li>
        <a
          href={'https://github.com/settings/tokens/new'}
          rel={'noreferrer'}
          target={'_blank'}
        >
          {
            'Settings → Developer settings → Personal access tokens (classic) → Generate new token'
          }
        </a>
      </li>

      <li>{'Give it a note, and an expiry — the shortest that suits you.'}</li>

      <li>
        <strong>{'Tick no scopes at all.'}</strong>{' '}
        {
          'In GitHub’s words, “a token with no assigned scopes can only access public information”. It cannot read a private repository, write anything, or act as you. Lost, it is worth one thing: somebody else’s 5,000 requests an hour.'
        }
      </li>
    </ol>

    <h4>{'Or: a fine-grained token, narrowed to this repository'}</h4>

    <ol>
      <li>
        <a
          href={'https://github.com/settings/personal-access-tokens/new'}
          rel={'noreferrer'}
          target={'_blank'}
        >
          {
            'Settings → Developer settings → Fine-grained personal access tokens → Generate new token'
          }
        </a>
      </li>

      <li>
        {'Repository access: Only select repositories → noshiro-pf/mono.'}
      </li>

      <li>
        {'Repository permissions: '}
        <strong>{'Issues → Read-only'}</strong>
        {
          '. Metadata → Read-only comes with it. Nothing else, and no account permissions.'
        }
      </li>

      <li>
        {
          '(A fine-grained token can read public repositories on its own, so the Issues permission may not even be needed — granting it is the version that is certain to work.)'
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
);
