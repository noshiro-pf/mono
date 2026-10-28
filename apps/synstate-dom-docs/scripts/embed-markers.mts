import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * Replaces the content of every `<!-- <name>:<key> -->…<!-- /<name> -->`
 * span. A key the page uses and `values` lacks is an error, and so is a key in
 * `values` the page never uses: a table that quietly stopped being embedded is
 * the drift the embedding scripts exist to prevent.
 */
export const embedInto = (
  page: string,
  name: MarkerName,
  values: ReadonlyRecord<string, Embedded>,
): Result<string, string> => {
  const mut_used = new Set<string>();

  const mut_missing: string[] = [];

  const replaced = page.replaceAll(
    markerPatterns[name],
    (match, key: string | undefined) => {
      const value = key === undefined ? undefined : values[key];

      if (key === undefined || value === undefined) {
        mut_missing.push(key ?? match);

        return match;
      }

      mut_used.add(key);

      return value.block
        ? `<!-- ${name}:${key} -->\n\n${value.text}\n\n<!-- /${name} -->`
        : `<!-- ${name}:${key} -->${value.text}<!-- /${name} -->`;
    },
  );

  if (Arr.isNonEmpty(mut_missing)) {
    return Result.err(
      `no value for ${mut_missing.map((key) => `"${name}:${key}"`).join(', ')}`,
    );
  }

  const unused = Object.keys(values).filter((key) => !mut_used.has(key));

  if (Arr.isNonEmpty(unused)) {
    return Result.err(
      `the page has no marker for ${unused.map((key) => `"${name}:${key}"`).join(', ')}`,
    );
  }

  return Result.ok(replaced);
};

/**
 * What a marker is replaced with. A block (a table, a paragraph) goes on lines
 * of its own so that Markdown still reads it as one; an inline figure stays
 * inside its sentence.
 */
export type Embedded = Readonly<{ text: string; block: boolean }>;

/** The `<name>` of `<!-- <name>:<key> -->`, one per embedding script. */
export type MarkerName = keyof typeof markerPatterns;

const markerPatterns = {
  benchmark: /<!-- benchmark:(?<key>[\w-]+) -->[\s\S]*?<!-- \/benchmark -->/gu,
  'bundle-size':
    /<!-- bundle-size:(?<key>[\w-]+) -->[\s\S]*?<!-- \/bundle-size -->/gu,
} as const;
