import { Arr, hasKey, isRecord, Obj } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * @internal `x` and `y`, two results of the same operation on `source` by types
 * that `source` has to satisfy together (an intersection's members, a key that
 * several merged records declare), merged deeply: plain objects key by key,
 * arrays of the same length element by element, and anything else to `y`.
 * Where `source` is not an array (missing, or `undefined` for the types'
 * defaults, which are made from no value), arrays of the same length are merged
 * by index.
 *
 * Each pruned result keeps only the paths its own type declares, so a shallow
 * spread would drop the nested paths an earlier one keeps wherever a later one
 * shares the key (two members with a `pos` sub-record of different fields);
 * repairs and defaults hold the paths their own type declares in the same way.
 */
export const deepMerge = (source: unknown, x: unknown, y: unknown): unknown => {
  if (isRecord(x) && isRecord(y) && (isPlainObject(x) || isPlainObject(y))) {
    const xMergedWithY = Obj.map(x, (xv, k) =>
      hasKey(y, k)
        ? deepMerge(
            isRecord(source) && hasKey(source, k) ? source[k] : undefined,
            xv,
            y[k],
          )
        : xv,
    );

    const yOnly = Obj.filter(y, (_yv, k) => !hasKey(x, k));

    return { ...xMergedWithY, ...yOnly };
  }

  // An array shorter than `source` had some of its elements dropped
  // (`onInvalidElement: 'drop'`), not necessarily the ones the other dropped,
  // or cut to a maximum length; which cannot be told here, so neither is merged
  // by index, since a dropped element would merge one element of `source` with
  // another. A repair then falls back to what else is tried.
  return Arr.isArray(x) &&
    Arr.isArray(y) &&
    x.length === y.length &&
    !(Arr.isArray(source) && x.length < source.length)
    ? x.map((xi, i) =>
        deepMerge(Arr.isArray(source) ? source[i] : undefined, xi, y[i]),
      )
    : y;
};

/**
 * @internal Whether `a` is a plain object: one whose prototype is
 * `Object.prototype` or `null`. Two values that are not (a `Map`, a `Set`, a
 * `Date` or another class instance, which need not hold their contents in
 * their own enumerable keys) are not merged key by key, which would make them a
 * plain object of the wrong keys: the later is kept whole, as for any other
 * value that is not merged. One merged with a plain object, which a record's
 * `prune` or `fill` makes of it, is merged by its own keys into a plain object.
 */
export const isPlainObject = (
  a: unknown,
): a is ReadonlyRecord<string, unknown> => {
  if (!isRecord(a)) {
    return false;
  }

  const proto: unknown = Object.getPrototypeOf(a);

  // By identity: a plain object of another realm (a `vm` context, an iframe) is
  // not one here, since telling that realm's `Object.prototype` from any other
  // object without a prototype takes more than identity, and accepting the
  // latter would merge an object that inherits its state key by key.
  return proto === Object.prototype || proto === null;
};
