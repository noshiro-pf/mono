/**
 * A preference kept in `localStorage` between visits, on this device only,
 * as the JSON of a value of `codec` under `key`. Every app under
 * `noshiro-pf.github.io` shares that storage, hence the prefixed keys. The
 * reading and writing themselves are `browser.mts`'s; this says what is
 * written and how what is read back is taken.
 *
 * What is read back is validated, and anything that is not a setting — an
 * older format, a hand edit — gives the codec's default rather than an
 * error: these are preferences, not data. It goes through the codec's
 * `fill`, so a record that is partly broken keeps the fields that are fine
 * and has the default in place of each broken or missing one (field by
 * field, in the elements of an array too), and fields the codec does not
 * know are dropped. `normalize` then tidies what was read, the default
 * included.
 */

import { Json, Result } from 'ts-data-forge';
import type * as t from 'ts-fortress';

export const persistedSetting = <A,>(
  codec: t.Type<A>,
  {
    key,
    normalize,
  }: Readonly<{
    key: string;
    normalize?: (value: A) => A;
  }>,
): PersistedSetting<A> => {
  const read = (stored: string | null): A => {
    if (stored === null) {
      return codec.defaultValue;
    }

    const json = Json.parse(stored);

    return Result.isOk(json) ? codec.fill(json.value) : codec.defaultValue;
  };

  return {
    key,
    parse: (stored) => {
      const value = read(stored);

      return normalize === undefined ? value : normalize(value);
    },
    serialize: (value) => JSON.stringify(codec.prune(value)),
  };
};

export type PersistedSetting<A> = Readonly<{
  /** The `localStorage` key. */
  key: string;
  /** What `stored` holds, or the default for nothing to read. */
  parse: (stored: string | null) => A;
  /** `value` as it is stored, without what the codec does not know. */
  serialize: (value: A) => string;
}>;
