import { constant, type JSX } from 'synstate-dom';

/** A task being worked on while one of its dependencies does not hold. */
export const WarningBadge = (): JSX.Element => (
  <span
    class={constant('bp6-tag bp6-round bp6-intent-danger warning-badge')}
    title={constant('依存が未解消のまま作業中です')}
  >
    {constant('⚠ 依存未解消')}
  </span>
);
