import type { AsyncIdle, AsyncPending } from '../async-data.mjs';

/** @internal Tag identifying the Idle variant. */
export const IdleTypeTagName: AsyncIdle['$$tag'] =
  'ts-data-forge::AsyncData.idle';

/** @internal Tag identifying the Pending variant. */
export const PendingTypeTagName: AsyncPending<unknown>['$$tag'] =
  'ts-data-forge::AsyncData.pending';
