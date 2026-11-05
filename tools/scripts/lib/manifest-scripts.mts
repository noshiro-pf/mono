import { hasKey, isRecord, isString, Obj, Optional } from 'ts-data-forge';
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
