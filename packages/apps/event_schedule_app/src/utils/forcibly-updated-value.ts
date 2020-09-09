/**
 * Wrapper object to avoid skipping updates by memoize.
 */
export type ForciblyUpdatedValue<T> = { value: T; _update_id: symbol };

export const forciblyUpdatedValue = <T>(value: T): ForciblyUpdatedValue<T> => ({
  value,
  _update_id: Symbol(),
});
