import { constant, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';

/** A task being worked on while one of its dependencies does not hold. */
export const WarningBadge = (): JSX.Element => (
  <span
    class={constant('bp6-tag bp6-round bp6-intent-danger warning-badge')}
    title={constant(m.list.warningTitle)}
  >
    {constant(m.list.warning)}
  </span>
);
