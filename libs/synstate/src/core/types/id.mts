import type { Brand, UnknownRecord } from 'ts-type-forge';

/**
 * Identifies one update. Opaque: an object issued per update, which is also
 * that update's queue.
 */
export type UpdateToken = Brand<UnknownRecord, 'update-token'>;
