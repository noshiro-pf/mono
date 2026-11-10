import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Obj,
  Optional,
  Result,
} from 'ts-data-forge';
import { Regex } from 'ts-std-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/** A manifest's `scripts`, the string-valued entries only. */
export const readScripts = (
  manifest: unknown,
): ReadonlyRecord<string, string> => {
  if (!isRecord(manifest) || !hasKey(manifest, 'scripts')) {
    return {};
  }

  const scripts = manifest.scripts;

  if (!isRecord(scripts)) {
    return {};
  }

  return Obj.filterMap(scripts, (body) =>
    isString(body) ? Optional.some(body) : Optional.none,
  );
};

/**
 * The script names a pattern from a script body selects.
 *
 * pnpm reads a name wrapped in slashes as a regular expression and
 * `npm-run-all` reads `*` as a glob; everything else is a literal name.
 */
export const matchScriptNames = (
  pattern: string,
  scriptNames: readonly string[],
): readonly string[] => {
  if (pattern.startsWith('/') && pattern.endsWith('/') && pattern.length > 1) {
    const expression = Regex.create(pattern.slice(1, -1), 'u');

    return Result.isErr(expression)
      ? []
      : scriptNames.filter((name) => expression.value.test(name));
  }

  return pattern.includes('*')
    ? scriptNames.filter((name) => matchesGlob(pattern, name))
    : scriptNames.includes(pattern)
      ? [pattern]
      : [];
};

/**
 * A script name against an `npm-run-all` glob, where `*` stands for any run of
 * characters. Matched rather than compiled, so that nothing here builds a
 * regular expression out of a string read from a manifest.
 */
export const matchesGlob = (pattern: string, name: string): boolean => {
  const segments = pattern.split('*');

  if (Arr.isFixedLengthArray(1, segments)) {
    return name === pattern;
  }

  const first = segments.at(0) ?? '';

  const last = segments.at(-1) ?? '';

  if (!name.startsWith(first) || !name.endsWith(last)) {
    return false;
  }

  if (first.length + last.length > name.length) {
    return false;
  }

  const mut_cursor = { at: first.length };

  for (const segment of segments.slice(1, -1)) {
    const found = name.indexOf(segment, mut_cursor.at);

    if (found === -1) {
      return false;
    }

    mut_cursor.at = found + segment.length;
  }

  return mut_cursor.at <= name.length - last.length;
};
