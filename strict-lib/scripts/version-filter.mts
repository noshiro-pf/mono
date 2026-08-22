import { Num, Arr, Result } from 'ts-data-forge';

export type Version = Readonly<{ major: number; minor: number }>;

export type VersionPredicate = (v: Version) => boolean;

/** Extracts the version from a `.../vX.Y/...` path, if present. */
export const versionFromPath = (filePath: string): Version | undefined => {
  const m = /[/\\]v(\d+)\.(\d+)[/\\]/u.exec(filePath);

  return m === null ? undefined : { major: Number(m[1]), minor: Number(m[2]) };
};

/**
 * Parses a full `--version` expression into a predicate, or `undefined` when
 * malformed. The value is an `&`-separated list of terms (all must hold). A
 * term is a version (`5`, `5.9`, `v5.9`) optionally prefixed by a comparator
 * (`>=`, `<=`, `>`, `<`, `=`):
 *
 *   5             only v5.x (major 5, any minor)
 *   5.9           only v5.9
 *   ">=5.3&<=5.5" only v5.3 .. v5.5
 *   ">=5.7"       only v5.7 and newer
 *
 * A bare major (`5`) matches the whole major line; a comparator on a bare major
 * (`>=5`) compares at the major level.
 */
export const parseVersionExpr = (
  expr: string,
): VersionPredicate | undefined => {
  const predicates = expr
    .split('&')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(parseVersionTerm);

  return Arr.isEmpty(predicates) || predicates.includes(undefined)
    ? undefined
    : (v) => predicates.every((p) => p?.(v) ?? false);
};

const OPERATORS = ['>=', '<=', '>', '<', '='] as const;

const parseVersionTerm = (term: string): VersionPredicate | undefined => {
  const cleaned = term.replaceAll(/\s+/gu, '');

  const op = OPERATORS.find((o) => cleaned.startsWith(o));

  const rest = op === undefined ? cleaned : cleaned.slice(op.length);

  const digits = rest.startsWith('v') ? rest.slice(1) : rest;

  const [majorStr, minorStr, ...extra] = digits.split('.');

  if (
    majorStr === undefined ||
    Arr.isNonEmpty(extra) ||
    !/^\d+$/u.test(majorStr) ||
    (minorStr !== undefined && !/^\d+$/u.test(minorStr))
  ) {
    return undefined;
  }

  const major = Result.unwrapOkOr(Num.safeParseFloat(majorStr), Number.NaN);

  const minor =
    minorStr === undefined
      ? undefined
      : Result.unwrapOkOr(Num.safeParseFloat(minorStr), Number.NaN);

  if (op === undefined) {
    return minor === undefined
      ? (v) => v.major === major
      : (v) => v.major === major && v.minor === minor;
  }

  return minor === undefined
    ? (v) => compareByOp(v.major, major, op)
    : (v) => compareByOp(compareVersion(v, { major, minor }), 0, op);
};

const compareVersion = (a: Version, b: Version): number =>
  a.major !== b.major ? a.major - b.major : a.minor - b.minor;

const compareByOp = (a: number, b: number, op: string): boolean =>
  op === '>='
    ? a >= b
    : op === '<='
      ? a <= b
      : op === '>'
        ? a > b
        : op === '<'
          ? a < b
          : a === b; // '='
