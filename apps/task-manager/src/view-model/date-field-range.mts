/**
 * The days a due date or a milestone's date can be picked or typed in, as
 * blueprint-synstate's `DateInput` takes them: from 1 January 2000 to 31
 * December 30 years after `todayYear`. Without them `DateInput` keeps
 * Blueprint's default, which ends six months from today — too soon for a plan —
 * and draws a stored date past it as an error. The start is fixed rather than
 * moving with the year, so that a date inside the range stays inside it as the
 * years pass.
 */
export const dateFieldRange = (todayYear: number) =>
  ({
    minDate: '2000-01-01',
    maxDate: `${todayYear + YEARS_AHEAD}-12-31`,
  }) as const;

const YEARS_AHEAD = 30;
