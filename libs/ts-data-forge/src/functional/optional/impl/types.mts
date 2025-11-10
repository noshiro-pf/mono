/**
 * Extracts the value type `S` from an {@link Some}<S>. If the
 * {@link Optional} is {@link None}, resolves to `never`.
 *
 * @template O The {@link UnknownOptional} type to unwrap.
 */
export type Unwrap<O extends UnknownOptional> =
  O extends Some<infer S> ? S : never;

/**
 * Narrows an {@link UnknownOptional} type to {@link Some}<S> if it is a
 * {@link Some}. If the {@link Optional} is {@link None}, resolves to `never`.
 *
 * @template O The {@link UnknownOptional} type to narrow.
 */
export type NarrowToSome<O extends UnknownOptional> = O extends None
  ? never
  : O;

/**
 * Narrows an {@link UnknownOptional} type to {@link None} if it is a
 * {@link None}. If the {@link Optional} is {@link Some}<S>, resolves to never.
 *
 * @template O The {@link UnknownOptional} type to narrow.
 */
export type NarrowToNone<O extends UnknownOptional> = O extends None
  ? O
  : never;
