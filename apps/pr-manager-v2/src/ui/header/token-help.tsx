import { constant, type JSX } from 'synstate-dom';
import { ExternalLink } from '../common/index.mjs';

export const TokenHelp = (): JSX.Element => (
  <details class={constant('token-help')}>
    <summary>{constant('Which token, and with what permissions?')}</summary>

    <p>
      {constant(
        'GraphQL answers nobody without a token, but reading a public repository needs no permission a stranger does not already have, so the right token is the weakest one you can make.',
      )}
    </p>

    <ul>
      <li>
        <ExternalLink href={constant('https://github.com/settings/tokens/new')}>
          {constant('A classic token')}
        </ExternalLink>
        {constant(
          ' with no scopes ticked: “a token with no assigned scopes can only access public information”.',
        )}
      </li>

      <li>
        <ExternalLink
          href={constant(
            'https://github.com/settings/personal-access-tokens/new',
          )}
        >
          {constant('Or a fine-grained token')}
        </ExternalLink>
        {constant(' with repository access set to “Public repositories”.')}
      </li>

      <li>
        {constant(
          'For a private repository, a fine-grained token with read-only access to it.',
        )}
      </li>
    </ul>

    <p>
      {constant(
        'It is kept in this tab only, gone when the tab closes, unless you tick “Remember on this device” — storage every app under noshiro-pf.github.io shares, so give such a token a short expiry. It is sent to api.github.com and nowhere else: the page’s Content-Security-Policy allows no other connection.',
      )}
    </p>
  </details>
);
