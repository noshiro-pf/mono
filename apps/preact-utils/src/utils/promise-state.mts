/**
 * A promise's progress as a value: pending, rejected, or resolved.
 *
 * Ported from `@noshiro/ts-utils-additional`; `ts-data-forge` has `Result`, but
 * nothing that carries the pending case.
 */
export type PromiseState<P, E, S> = Readonly<
  | { status: 'pending'; value: P }
  | { status: 'error'; value: E }
  | { status: 'success'; value: S }
>;
