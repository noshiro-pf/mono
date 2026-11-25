import { hasKey } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/** A message string split at its placeholders. */
export type Template = Readonly<{
  /**
   * The text before each placeholder, and the text after the last one: one more
   * entry than `names`.
   */
  texts: readonly string[];
  names: readonly string[];
}>;

/** `message` split at its placeholders, scanned afresh. */
export const scan = (message: string): Template => {
  const mut_texts: string[] = [];

  const mut_names: string[] = [];

  let mut_last = 0;

  for (const match of message.matchAll(placeholderPattern)) {
    mut_texts.push(message.slice(mut_last, match.index));

    mut_names.push(match[1] ?? '');

    mut_last = match.index + match[0].length;
  }

  mut_texts.push(message.slice(mut_last));

  return { texts: mut_texts, names: mut_names };
};

/**
 * `message` split at its placeholders, scanned once however often it is filled.
 * For the messages of the catalogs a store has loaded; a string from anywhere
 * else goes through {@link scan}. The cache is shared by every store and holds
 * at most {@link compiledLimit} templates, dropping the oldest, so that a
 * process that keeps making stores from changing catalogs does not keep every
 * string it has seen.
 */
export const compileMessage = (message: string): Template => {
  const hit = mut_compiled.get(message);

  if (hit !== undefined) {
    return hit;
  }

  const made = scan(message);

  // The oldest out, as a `Map` keeps the order entries went in. Oldest, not
  // least used: reordering on each hit would cost two writes per render, for a
  // limit far above the messages an application holds.
  if (mut_compiled.size >= compiledLimit) {
    const [oldest] = mut_compiled.keys();

    if (oldest !== undefined) {
      mut_compiled.delete(oldest);
    }
  }

  mut_compiled.set(message, made);

  return made;
};

/**
 * Empties the cache: for the test of its limit, which fills it, so that the
 * tests run after it in the same process find it as a store would.
 */
// Shipped, though only a test calls it: three lines, and the package's
// `exports` do not reach `internal/`.

export const clearCompiled = (): void => {
  mut_compiled.clear();
};

/**
 * `template` with each placeholder replaced by its value in `values`. A
 * placeholder with no value is left as written, and a value is not scanned for
 * placeholders again.
 */
export const fill = (
  { texts, names }: Template,
  values: ReadonlyRecord<string, unknown>,
): string => {
  let mut_result = texts[0] ?? '';

  for (const [i, name] of names.entries()) {
    const value = hasKey(values, name) ? values[name] : undefined;

    mut_result +=
      typeof value === 'string' || typeof value === 'number'
        ? value.toString()
        : `{${name}}`;

    mut_result += texts[i + 1] ?? '';
  }

  return mut_result;
};

const placeholderPattern = /\{([^{}]+)\}/gu;

/**
 * Well above the messages of an application's loaded catalogs, every locale and
 * store together. Past it the oldest is dropped first, not the least used: an
 * application that fills more than this many strings in turn rescans each one,
 * the cost of keeping a hit free of writes.
 */
export const compiledLimit = 50_000;

const mut_compiled = new Map<string, Template>();
