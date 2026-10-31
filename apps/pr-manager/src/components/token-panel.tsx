import { constant, derive, MatchOptional, view, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { isRunningLow, type RateLimit } from '../rate-limit.mjs';
import { reader, tokenStore } from '../store/index.mjs';
import type { StoredToken } from '../token.mjs';
import { ExternalLink } from './external-link.js';

/**
 * Where a reader gives the page a token, and — the part that matters more —
 * where they are told which one to make.
 *
 * Open until there is a token, because the page reads nothing without one, and
 * closed after, because then it has nothing left to ask. What is behind it is
 * the recipe and the reason for it: GraphQL answers nobody without a token, but
 * reading a public repository needs no permission at all, so the token this
 * page wants is the weakest GitHub can mint. Saying so is what keeps a reader
 * from reaching for `repo` because it sounded like the one that works.
 */
export const TokenPanel = (): JSX.Element => {
  const { token } = tokenStore;

  const noToken = view(token, (held) => held === undefined);

  // Said in the sentence as well as shown in the colour: the reserved status
  // steps are not allowed to carry a meaning on their own here, and a reader
  // who cannot tell the two greys apart still has to learn that the page is
  // about to stop being able to look.
  const low = view(
    reader.rateLimit,
    (rateLimit) => rateLimit !== undefined && isRunningLow(rateLimit),
  );

  return (
    <details class={constant('token-panel')} open={noToken}>
      <summary class={constant('token-summary')}>
        {view(token, (held) =>
          held === undefined ? 'A token is needed' : 'Reading with a token',
        )}
      </summary>

      <div class={constant('token-body')}>
        <p class={{ 'token-state': constant(true), 'token-state-low': low }}>
          {derive([token, reader.rateLimit, reader.pollIntervalMs], stateWords)}
        </p>

        <form
          class={constant('token-form')}
          onSubmit={(submitted) => {
            // The page has nowhere to submit to — `form-action 'none'` in the
            // policy says as much — and the element is a form so that Enter
            // submits it.
            submitted.preventDefault();

            tokenStore.submit();
          }}
        >
          <label class={constant('token-field')} htmlFor={constant(INPUT_ID)}>
            {constant('GitHub personal access token')}
          </label>

          <input
            autocomplete={constant('off')}
            class={constant('token-input')}
            id={constant(INPUT_ID)}
            placeholder={view(token, (held) =>
              held === undefined ? 'ghp_… or github_pat_…' : '••••••••',
            )}
            type={constant('password')}
            value={tokenStore.typed}
            onInput={(changed) => {
              tokenStore.setTyped(changed.currentTarget.value);
            }}
          />

          <label
            class={constant('token-remember')}
            htmlFor={constant(REMEMBER_ID)}
          >
            <input
              checked={tokenStore.remember}
              id={constant(REMEMBER_ID)}
              type={constant('checkbox')}
              onChange={(changed) => {
                tokenStore.setRemember(changed.currentTarget.checked);
              }}
            />

            {constant('Remember on this device')}
          </label>

          <div class={constant('token-actions')}>
            <button class={constant('token-use')} type={constant('submit')}>
              {constant('Use this token')}
            </button>

            <button
              class={constant('token-clear')}
              type={constant('button')}
              onClick={tokenStore.forget}
            >
              {constant('Clear')}
            </button>
          </div>
        </form>

        <MatchOptional
          value={view(tokenStore.saveError, Optional.fromNullable)}
          some={(saveError$) => (
            <p class={constant('token-error')}>{saveError$}</p>
          )}
        />

        <TokenHelp />
      </div>
    </details>
  );
};

const INPUT_ID = 'github-token';

const REMEMBER_ID = 'github-token-remember';

/**
 * What GitHub allows, said before it has answered for the first time. Only the
 * fallback: the numbers on screen after that are GitHub's own.
 */
const GRAPHQL_LIMIT = 5000;

/**
 * The budget belongs to the token's account, so anything else that account does
 * with GraphQL spends it too.
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

const stateWords = (
  token: StoredToken | undefined,
  rateLimit: RateLimit | undefined,
  pollIntervalMs: number,
): string =>
  token === undefined
    ? 'Nothing is read until there is one.'
    : (`Held ${token.store === 'device' ? 'on this device' : 'in this tab only'}. ${limitWords(rateLimit)} Reading every ${seconds(pollIntervalMs)} while this tab is visible.${rateLimit !== undefined && isRunningLow(rateLimit) ? RUNNING_LOW : ''}` as const);

/**
 * The permissions, in the form of the two token pages a reader would open.
 *
 * Deliberately specific. "Read-only access" is the kind of instruction that
 * gets read as `repo` on the classic page, which is write access to every
 * private repository the account can see — so the classic recipe here is *tick
 * nothing*, in those words, with GitHub's own sentence about what that grants.
 */
const TokenHelp = (): JSX.Element => (
  <details class={constant('token-help')}>
    <summary>{constant('Which token, and with what permissions?')}</summary>

    <p>
      {constant(
        'This page asks GitHub’s GraphQL API about the pull requests of a public repository, and nothing else. GraphQL answers nobody without a token, but reading a public repository needs no permission you do not already have as a stranger. So the right token here is the weakest one you can make.',
      )}
    </p>

    <h4>{constant('Simplest: a classic token with nothing ticked')}</h4>

    <ol>
      <li>
        <ExternalLink href={constant('https://github.com/settings/tokens/new')}>
          {constant(
            'Settings → Developer settings → Personal access tokens (classic) → Generate new token',
          )}
        </ExternalLink>
      </li>

      <li>
        {constant(
          'Give it a note, and an expiry — the shortest that suits you.',
        )}
      </li>

      <li>
        <strong>{constant('Tick no scopes at all.')}</strong>
        {constant(' ')}
        {constant(
          'In GitHub’s words, “a token with no assigned scopes can only access public information”. It cannot read a private repository, write anything, or act as you. Lost, it is worth one thing: somebody else’s share of your rate limit.',
        )}
      </li>
    </ol>

    <h4>
      {constant('Or: a fine-grained token that reads public repositories')}
    </h4>

    <ol>
      <li>
        <ExternalLink
          href={constant(
            'https://github.com/settings/personal-access-tokens/new',
          )}
        >
          {constant(
            'Settings → Developer settings → Fine-grained personal access tokens → Generate new token',
          )}
        </ExternalLink>
      </li>

      <li>
        {constant('Repository access: ')}
        <strong>{constant('Public repositories')}</strong>
        {constant(
          '. That is read-only access to what anyone can already see, and no permissions need adding to it.',
        )}
      </li>
    </ol>

    <h4>{constant('Where it is kept')}</h4>

    <p>
      {constant(
        'By default, in this tab only: it is gone when the tab closes. “Remember on this device” moves it to storage that survives the browser being shut — which on GitHub Pages is shared by every app published under noshiro-pf.github.io, so it is worth the shorter expiry if you tick it.',
      )}
    </p>

    <p>
      {constant(
        'It is sent to api.github.com and nowhere else. The page’s Content-Security-Policy allows no other connection, so that is a property of the page rather than a promise about its code.',
      )}
    </p>
  </details>
);
