import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * Replaces the content of every `<!-- <name>:<key> -->…<!-- /<name> -->` span,
 * spelt `{/* <name>:<key> *\/}…{/* /<name> *\/}` in MDX, which has no HTML
 * comments. A key the page uses and `values` lacks is an error, and so is a key
 * in `values` the page never uses: a table that quietly stopped being embedded
 * is the drift the embedding scripts exist to prevent. With `unknownKeys:
 * 'keep'`, a key the page uses and `values` lacks is left as it is instead,
 * for a caller that fills only some of a page's markers.
 */
export const embedInto = (
  page: string,
  name: MarkerName,
  values: ReadonlyRecord<string, Embedded>,
  unknownKeys: 'reject' | 'keep' = 'reject',
): Result<string, string> => {
  const mut_used = new Set<string>();

  const mut_missing: string[] = [];

  const replaced = spellings.reduce(
    (mut_page, { pattern, open, close }) =>
      mut_page.replaceAll(pattern[name], (match, key: string | undefined) => {
        const value = key === undefined ? undefined : values[key];

        if (key === undefined || value === undefined) {
          if (unknownKeys === 'reject') {
            mut_missing.push(key ?? match);
          }

          return match;
        }

        mut_used.add(key);

        return value.block
          ? `${open(name, key)}\n\n${value.text}\n\n${close(name)}`
          : `${open(name, key)}${value.text}${close(name)}`;
      }),
    page,
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

/** The keys of the `<name>:` markers a page uses, in either spelling. */
export const markerKeys = (
  page: string,
  name: MarkerName,
): ReadonlySet<string> =>
  new Set(
    spellings.flatMap(({ pattern }) =>
      Array.from(
        page.matchAll(pattern[name]),
        (match) => match.groups?.['key'],
      ).filter((key) => key !== undefined),
    ),
  );

/**
 * The page with every `<name>:` span, markers and content, removed: what is
 * left is the text no marker fills.
 */
export const stripMarkers = (page: string, name: MarkerName): string =>
  spellings.reduce(
    (mut_page, { pattern }) => mut_page.replaceAll(pattern[name], ''),
    page,
  );

/**
 * What a marker is replaced with. A block (a table, a paragraph) goes on lines
 * of its own so that Markdown still reads it as one; an inline figure stays
 * inside its sentence.
 */
export type Embedded = Readonly<{ text: string; block: boolean }>;

/** The `<name>` of `<!-- <name>:<key> -->`, one per embedding script. */
export type MarkerName = 'benchmark' | 'bundle-size';

/**
 * The two spellings of a marker, Markdown's and MDX's. A key is a word with
 * hyphens and slashes (`worst/synstate-dom`).
 */
const spellings: readonly Readonly<{
  pattern: ReadonlyRecord<MarkerName, RegExp>;
  open: (name: MarkerName, key: string) => string;
  close: (name: MarkerName) => string;
}>[] = [
  {
    pattern: {
      benchmark:
        /<!-- benchmark:(?<key>[\w/-]+) -->[\s\S]*?<!-- \/benchmark -->/gu,
      'bundle-size':
        /<!-- bundle-size:(?<key>[\w/-]+) -->[\s\S]*?<!-- \/bundle-size -->/gu,
    },
    open: (name, key) => `<!-- ${name}:${key} -->`,
    close: (name) => `<!-- /${name} -->`,
  },
  {
    pattern: {
      benchmark:
        /\{\/\* benchmark:(?<key>[\w/-]+) \*\/\}[\s\S]*?\{\/\* \/benchmark \*\/\}/gu,
      'bundle-size':
        /\{\/\* bundle-size:(?<key>[\w/-]+) \*\/\}[\s\S]*?\{\/\* \/bundle-size \*\/\}/gu,
    },
    open: (name, key) => `{/* ${name}:${key} */}`,
    close: (name) => `{/* /${name} */}`,
  },
] as const;
