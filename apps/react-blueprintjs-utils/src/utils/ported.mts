/**
 * What `ts-data-forge` has no successor for.
 *
 * Both came from `@noshiro/ts-utils` / `@noshiro/ts-utils-additional` before
 * the monorepo consolidation.
 */

import type { FixedLengthTuple } from 'ts-type-forge';

/** Whether the string looks like an email address. */
export const isEmailString = (str: string): boolean =>
  // eslint-disable-next-line require-unicode-regexp, security/detect-unsafe-regex, no-useless-escape
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    str,
  );

/** A six-digit hex colour to `[r, g, b]`; black for anything that is not one. */
export const hexToRgb = (hex: string): FixedLengthTuple<3, number> => {
  if (!/^#[0-9a-f]{6}$/iu.test(hex)) {
    return [0, 0, 0];
  }

  const parse = (from: number): number =>
    Math.min(255, Math.max(0, Number.parseInt(hex.slice(from, from + 2), 16)));

  return [parse(1), parse(3), parse(5)];
};
