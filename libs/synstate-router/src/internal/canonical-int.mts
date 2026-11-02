import { isSafeInt, Optional, type SafeInt } from 'ts-data-forge';

/**
 * Reads a safe integer written in canonical form (`01`, `+1`, `1.0` and `-0`
 * are not), shared by `param.int` and `search.int` so that a path and a query
 * agree.
 */
export const decodeCanonicalInt = (raw: string): Optional<SafeInt> => {
  if (!canonicalIntPattern.test(raw)) {
    return Optional.none;
  }

  // The pattern has already checked the canonical form, which parseInt reads
  // the same way as Num.safeParseInt; this keeps the Num namespace out of the
  // bundle.
  // eslint-disable-next-line ts-data-forge/prefer-num-safe-parse-int
  const n = Number.parseInt(raw, 10);

  return isSafeInt(n) ? Optional.some(n) : Optional.none;
};

/** The canonical form only, so that each integer has one URL. */
const canonicalIntPattern = /^(?:0|-?[1-9]\d*)$/u;
