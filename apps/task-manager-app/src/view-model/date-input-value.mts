/**
 * Between a draft's date field — `YYYY-MM-DDTHH:mm` on the browser's wall
 * clock, empty for none (`datetime-local.mts`) — and the value of
 * Blueprint's `DateInput`: an ISO string or `null`. The picker reads a
 * string with no offset as local time and writes one with the browser's
 * offset, so the wall-clock part is what carries over in both directions.
 */

import { fromDateTimeLocal } from './datetime-local.mjs';

/** The picker's value for a draft field; `null` shows it empty. */
export const toDateInputValue = (draft: string): string | null =>
  fromDateTimeLocal(draft) === undefined ? null : draft;

/** The draft field for the picker's value; empty when it was cleared. */
export const fromDateInputValue = (value: string | null): string => {
  const wallClock = value?.slice(0, WALL_CLOCK_LENGTH) ?? '';

  return fromDateTimeLocal(wallClock) === undefined ? '' : wallClock;
};

/** `YYYY-MM-DDTHH:mm`. */
const WALL_CLOCK_LENGTH = 16;
