import { combine, map, type InitializedObservable } from 'synstate';
import { constant, If, MatchOptional, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { describeInterval, type RateLimit } from '../../domain/index.mjs';
import type { StoredToken } from '../../github/index.mjs';
import type { TokenStore } from '../../store/index.mjs';
import './header.css';
import { TokenHelp } from './token-help.js';

type Props = Readonly<{
  token: TokenStore;
  /** GitHub refused the token on the latest read (a 401). */
  refused: InitializedObservable<boolean>;
  /** What is left of the budget and how often the page reads, once it reads. */
  budget: InitializedObservable<
    Readonly<{ rateLimit: RateLimit | undefined; intervalMs: number }>
  >;
}>;

/**
 * The token panel (spec §3): open until there is a token, then a one-line
 * summary that opens to change or clear it.
 */
export const TokenPanel = ({ token, budget, refused }: Props): JSX.Element => (
  <details
    class={constant('token-panel')}
    open={combine([token.token, refused]).pipe(
      map(([held, no]) => held === undefined || no),
    )}
  >
    <summary>
      {combine([token.token, refused]).pipe(
        map(([held, no]) =>
          held === undefined
            ? 'A token is needed'
            : no
              ? 'GitHub refused this token'
              : 'Reading with a token',
        ),
      )}
    </summary>

    <If
      cond={refused}
      then={
        <p class={constant('token-error')}>
          {constant(
            'GitHub answered 401 for it: the token is mistyped, expired or revoked. Paste a new one below.',
          )}
        </p>
      }
    />

    <p class={constant('token-state')}>
      {combine([token.token, budget]).pipe(
        map(([held, b]) => stateWords(held, b)),
      )}
    </p>

    <form
      class={constant('token-form')}
      onSubmit={(event) => {
        // A form so that Enter submits; there is nowhere to submit to.
        event.preventDefault();

        token.submit();
      }}
    >
      <label htmlFor={constant(INPUT_ID)}>
        {constant('GitHub personal access token')}
      </label>

      <input
        autocomplete={constant('off')}
        id={constant(INPUT_ID)}
        placeholder={token.token.pipe(
          map((held) =>
            held === undefined ? 'ghp_… or github_pat_…' : '••••••••',
          ),
        )}
        type={constant('password')}
        value={token.typed}
        onInput={(event) => {
          token.setTyped(event.currentTarget.value);
        }}
      />

      <label class={constant('token-remember')}>
        <input
          checked={token.remember}
          type={constant('checkbox')}
          onChange={(event) => {
            token.setRemember(event.currentTarget.checked);
          }}
        />
        {constant('Remember on this device')}
      </label>

      <span class={constant('token-actions')}>
        <button class={constant('button')} type={constant('submit')}>
          {constant('Use this token')}
        </button>

        <button
          class={constant('button')}
          type={constant('button')}
          onClick={token.clear}
        >
          {constant('Clear')}
        </button>
      </span>
    </form>

    <MatchOptional
      value={token.saveError.pipe(map(Optional.fromNullable))}
      some={(error) => <p class={constant('token-error')}>{error}</p>}
    />

    <TokenHelp />
  </details>
);

const INPUT_ID = 'github-token';

const stateWords = (
  held: StoredToken | undefined,
  budget: Readonly<{ rateLimit: RateLimit | undefined; intervalMs: number }>,
): string => {
  if (held === undefined) {
    return 'Nothing is read until there is one.';
  }

  const where = held.place === 'device' ? 'on this device' : 'in this tab only';

  const { rateLimit } = budget;

  const left =
    rateLimit === undefined
      ? '5,000 GraphQL points an hour.'
      : (`${rateLimit.remaining.toLocaleString('en')} of ${rateLimit.limit.toLocaleString('en')} GraphQL points left this hour.` as const);

  const low =
    rateLimit !== undefined && rateLimit.remaining <= rateLimit.limit / 4
      ? ' Running low: the budget is the account’s, shared with everything else it does with GraphQL, and resets within the hour.'
      : '';

  return `Held ${where}. ${left} Reading every ${describeInterval(budget.intervalMs)} while this tab is visible.${low}`;
};
