import { Num } from 'ts-data-forge';
import { nextChangeAt, type DomainState } from '../domain/index.mjs';

/**
 * How long to wait before reading the clock again: until the next change the
 * passage of time makes (see `nextChangeAt`), but never longer than
 * `maxDelayMs` — a timer set for days does not survive a laptop sleeping, and
 * a short one costs one comparison.
 */
export const nextTickDelay = (
  state: DomainState,
  now: number,
  maxDelayMs: number,
): number => {
  const next = nextChangeAt(state, now);

  return next === undefined ? maxDelayMs : Num.clamp(next - now, 0, maxDelayMs);
};
