import { memoNamed } from 'preact-utils';

/** A task being worked on while one of its dependencies does not hold. */
export const WarningBadge = memoNamed('WarningBadge', () => (
  <span
    className={'bp6-tag bp6-round bp6-intent-danger warning-badge'}
    title={'依存が未解消のまま作業中です'}
  >
    {'⚠ 依存未解消'}
  </span>
));
