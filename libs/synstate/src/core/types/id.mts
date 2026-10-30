import type { Brand, UnknownRecord } from 'ts-type-forge';

/**
 * Identifies one update. Opaque: an object issued per update, which is also
 * that update's queue — except for a write nothing observes, which opens no
 * update and is issued a token with no queue behind it.
 */
export type UpdateToken = Brand<UnknownRecord, 'update-token'>;
