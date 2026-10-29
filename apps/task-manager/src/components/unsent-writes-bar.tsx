import { constant, If, view, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { sessionStore } from '../store/index.mjs';

/**
 * Asks what to do when a sign-out stopped because writes made offline could
 * not be sent: signing out deletes them with the rest of the data kept on
 * this device.
 */
export const UnsentWritesBar = (): JSX.Element => (
  <If
    cond={view(sessionStore.signOutState, (state) => state === 'unsent-writes')}
    then={
      <div
        class={constant('bp6-callout bp6-intent-warning notice-bar')}
        data-e2e={constant('unsent-writes')}
        role={constant('alert')}
      >
        <span>{constant(m.unsentWrites.message)}</span>
        <span class={constant('unsent-writes-actions')}>
          <button
            class={constant('bp6-button bp6-intent-danger')}
            type={constant('button')}
            onClick={sessionStore.discardUnsentWritesAndSignOut}
          >
            {constant(m.unsentWrites.discard)}
          </button>
          <button
            class={constant('bp6-button bp6-minimal')}
            type={constant('button')}
            onClick={sessionStore.cancelSignOut}
          >
            {constant(m.unsentWrites.stay)}
          </button>
        </span>
      </div>
    }
  />
);
