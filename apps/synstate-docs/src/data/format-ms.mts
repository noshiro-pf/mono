/**
 * How a measurement is written wherever the site quotes one: the prose numbers
 * `gen:benchmark-doc` embeds, and the values a chart labels beside its axis.
 * One definition, so that a chart cannot round a value the sentence under it
 * quotes differently.
 */

import { Num } from 'ts-data-forge';

/**
 * Renders a measurement the way the prose quotes one: a tenth of a millisecond
 * below 100 ms, and whole milliseconds above it, where the tenth is noise. The
 * threshold is read off the value rounded to a tenth, so that 99.97 prints as
 * `100 ms` rather than `100.0 ms`.
 */
export const formatMs = (value: number): string =>
  Num.roundAt(value, 1) < MS_TENTHS_BELOW
    ? (`${value.toFixed(1)} ms` as const)
    : (`${formatCount(Math.round(value))} ms` as const);

/** Digits in groups of three, as every number in the prose is written. */
export const formatCount = (value: number): string => {
  const rounded = Math.round(value);

  const sign = rounded < 0 ? '-' : '';

  const digits = Math.abs(rounded).toString();

  const mut_groups: string[] = [];

  let mut_rest = digits;

  while (mut_rest.length > 3) {
    mut_groups.unshift(mut_rest.slice(-3));

    mut_rest = mut_rest.slice(0, -3);
  }

  mut_groups.unshift(mut_rest);

  return `${sign}${mut_groups.join(',')}`;
};

/** Where {@link formatMs} stops printing a tenth of a millisecond. */
export const MS_TENTHS_BELOW = 100;
