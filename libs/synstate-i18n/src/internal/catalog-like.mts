import { hasKey, isNonNullObject } from 'ts-data-forge';
import * as Arr from 'ts-data-forge/array';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * An object that can be the root of a catalog: a group, and not a thenable,
 * which `ja: import('./ja.mjs')` gives when the loader's arrow is left out. A
 * module namespace is one: its exports are the messages. What `createI18n`
 * accepts as a translation; `checkTranslation` reads the root the same way,
 * save that it reads on into one with a `then` of its own to report the key.
 */
export const isCatalogLike = (
  value: unknown,
): value is ReadonlyRecord<string, unknown> =>
  isGroup(value) && !isThenable(value);

/**
 * Whether `value` has a callable `then`, as a promise of any library does. No
 * catalog has one, since no message may be named `then`. A proxy whose trap
 * throws on `then` is not one.
 */
export const isThenable = (value: unknown): boolean => {
  if (!isNonNullObject(value)) {
    return false;
  }

  try {
    return typeof Reflect.get(value, 'then') === 'function';
  } catch {
    return false;
  }
};

/**
 * Whether `value` is a catalog with a `then` of its own, as no catalog may have:
 * a mistake in the catalog, not a promise for one.
 */
export const hasOwnThen = (value: unknown): boolean =>
  isGroup(value) && hasKey(value, 'then');

/**
 * Handles the rejection of a thenable refused as a catalog, such as an
 * `import()` given without its loader's arrow: should the import fail, its
 * rejection would otherwise be reported as unhandled beside the error refusing
 * it. An object made from `Promise.prototype` that is no promise is adopted in
 * a job of its own, where its `then` throws, and that rejection is handled too.
 */
export const ignoreRejection = (value: unknown): void => {
  // A promise only, of any realm: the `then` of any other thenable may start
  // work, such as a lazy query's request, that a store never made should not.
  if (isPromise(value)) {
    Promise.resolve(value).catch(() => undefined);
  }
};

/** What to suggest for a translation that is a thenable. */
export const loaderHint = (value: unknown): string =>
  isThenable(value) && hasOwnThen(value)
    ? ' (it has a `then` of its own: a message named `then`, which no catalog may have, or a thenable whose loader is missing its `() =>`)'
    : isPromise(value)
      ? ' (is the loader missing its `() =>`?)'
      : isThenable(value)
        ? ' (it is a thenable)'
        : '';

/**
 * The path of the first message named `then` in `catalog`, if any. Its accessor
 * in `t` or `peek` would make the tree holding it a thenable, which `await` and
 * a promise call instead of resolving to.
 */
export const messageNamedThen = (
  catalog: ReadonlyRecord<string, unknown>,
  path: readonly string[] = [],
): readonly string[] | undefined => {
  for (const [key, value] of Object.entries(catalog)) {
    // Into any group, a thenable one too: that is what this looks for.
    if (isGroup(value)) {
      const found = messageNamedThen(value, Arr.toPushed(path, key));

      if (found !== undefined) {
        return found;
      }
    } else if (key === 'then') {
      return Arr.toPushed(path, key);
    }
  }

  return undefined;
};

/**
 * The path of the first value of `catalog` that is neither a string, a function
 * nor a group (an array, `null`, a number, a `Date`), if any: what a base
 * catalog from untyped code can hold, and the store would have no accessor for.
 * A group here is a plain object ({@link isPlainGroup}), as one written in a
 * catalog is.
 */
export const nonMessageIn = (
  catalog: ReadonlyRecord<string, unknown>,
  path: readonly string[] = [],
): readonly string[] | undefined => {
  for (const [key, value] of Object.entries(catalog)) {
    const at = Arr.toPushed(path, key);

    if (isPlainGroup(value)) {
      const found = nonMessageIn(value, at);

      if (found !== undefined) {
        return found;
      }
    } else if (typeof value !== 'string' && typeof value !== 'function') {
      return at;
    }
  }

  return undefined;
};

/**
 * An object below the root of a catalog: not null and not an array. Nothing
 * below the root is ever loaded, so a thenable is a group like any other there;
 * only the root is tested by {@link isCatalogLike}.
 */
// A revoked proxy, on which `Array.isArray` throws, is not guarded against:
// nothing makes a catalog of one.

export const isGroup = (
  value: unknown,
): value is ReadonlyRecord<string, unknown> =>
  isNonNullObject(value) && !Arr.isArray(value);

/**
 * A group as a base catalog holds one: a plain object, of any realm (its
 * prototype is `null`, or one whose prototype is, as `Object.prototype` is), or
 * a module namespace. A `Date`, a `Map` or a class instance is not.
 */
export const isPlainGroup = (
  value: unknown,
): value is ReadonlyRecord<string, unknown> => {
  if (!isGroup(value)) {
    return false;
  }

  const proto: unknown = Object.getPrototypeOf(value);

  return proto === null || Object.getPrototypeOf(proto) === null;
};

/** Whether `value` is a promise, of any realm, and not another thenable. */
export const isPromise = (value: unknown): boolean => {
  if (!isThenable(value)) {
    return false;
  }

  // As in `isThenable`: a proxy whose trap throws on its tag is no promise.
  try {
    return Object.prototype.toString.call(value) === '[object Promise]';
  } catch {
    return false;
  }
};

/**
 * Whether `value` is a module namespace, as a loader returning `import()` whole
 * gives.
 */
export const isModuleNamespace = (value: unknown): boolean => {
  if (!isGroup(value)) {
    return false;
  }

  // As in `isThenable`: a proxy whose trap throws on unknown keys is no module.
  try {
    return Reflect.get(value, Symbol.toStringTag) === 'Module';
  } catch {
    return false;
  }
};
