/**
 * Replace all instances of a substring in a string, using a regular expression
 * or search string.
 *
 * @param searchValue A string to search for.
 * @param replaceValue A string containing the text to replace for every
 *   successful match of searchValue in this string.
 * @param options Options. The default value is `{ throwOnNotFound: true,
 *   throwOnNoChange: true }`
 * @throws {Error} If no match is found.
 */
export const replaceWithNoMatchCheck =
  (
    searchValue: RegExp | string,
    replaceValue: string,
    options?: Readonly<
      | {
          onNotFound: 'off';
          onNoChange?: 'off';
        }
      | {
          onNotFound: 'warn';
          onNoChange?: 'off' | 'warn';
        }
      | {
          onNotFound: 'throw';
          onNoChange?: 'off' | 'throw' | 'warn';
        }
    >,
  ): ((target: string) => string) =>
  (target) => {
    // Strings are matched via a whitespace-flexible regex rather than a
    // literal substring, since oxfmt may re-wrap long type signatures
    // (e.g. onto multiple lines with indentation) between when a pattern was
    // authored and when it is matched against freshly-fetched lib files.
    const effectiveSearchValue =
      typeof searchValue === 'string'
        ? flexibleWhitespaceRegExp(searchValue)
        : searchValue;

    if (target.search(effectiveSearchValue) < 0) {
      const msg =
        `No match found for "${chopIfLong(searchValue)}" in "${chopIfLong(
          target,
        )}".` as const;

      switch (options?.onNotFound) {
        case undefined:
        case 'throw':
          throw new Error(msg);

        case 'warn':
          console.warn(msg);

          return target;

        case 'off':
          return target;
      }
    }

    const result =
      searchValue === replaceValue
        ? target
        : // `replaceValue` intentionally supports `$1` capture references and
          // literal `$` — the `$`-substitution is a feature many converters
          // rely on, so the non-literal replacement is deliberate here.
          // eslint-disable-next-line unicorn/no-unsafe-string-replacement
          target.replaceAll(effectiveSearchValue, replaceValue);

    if (target === result) {
      const msg =
        searchValue === replaceValue
          ? (`searchValue is equal to replaceValue: "${replaceValue}".` as const)
          : (`Replacing had no effect. (searchValue = "${chopIfLong(searchValue)}"; target = "${chopIfLong(
              target,
            )}".` as const);

      switch (options?.onNoChange) {
        case 'throw':
          throw new Error(msg);

        case 'warn':
          console.warn(msg);

          return target;

        case undefined:
        case 'off':
          return target;
      }
    }

    return result;
  };

const sliceMaxLength = 100;

const chopIfLong = (str: RegExp | string): string =>
  typeof str === 'string'
    ? str.length > sliceMaxLength
      ? (`${str.slice(0, sliceMaxLength)} ...(and more)` as const)
      : str
    : str.source;

const regExpSpecialChar = /[.*+?^${}()|[\]\\]/u;

const wordChar = /[A-Za-z0-9_$]/u;

const escapeToken = (token: string): string =>
  Array.from(token, (ch) => (regExpSpecialChar.test(ch) ? `\\${ch}` : ch)).join(
    '',
  );

/**
 * Splits `text` into literal tokens: maximal runs of word characters
 * (identifiers/numbers) are kept together as a single token, while every other
 * non-whitespace character becomes its own token. Whitespace itself is dropped,
 * since flexible whitespace is reinstated between tokens by
 * `flexibleWhitespaceRegExp`.
 */
const tokenize = (text: string): readonly string[] => {
  const mut_tokens: string[] = [] as const;

  let i = 0 as const;

  while (i < text.length) {
    const ch = text[i] ?? '';

    if (/\s/u.test(ch)) {
      i += 1;

      continue;
    }

    if (wordChar.test(ch)) {
      let j = i;

      while (j < text.length && wordChar.test(text[j] ?? '')) {
        j += 1;
      }

      mut_tokens.push(text.slice(i, j));

      i = j;
    } else {
      mut_tokens.push(ch);

      i += 1;
    }
  }

  return mut_tokens;
};

/**
 * Tokens after which oxfmt's multiline "leading-pipe" union style may insert an
 * extra `|` before the next token (i.e. positions where a type position can
 * start: after `:`, `(`, `,`, `|`, or `=`).
 */
const unionStartTokens = new Set([':', '(', ',', '|', '=']);

/**
 * Builds a regex matching `text` that tolerates oxfmt re-wrapping `text` onto
 * multiple lines (e.g. long type parameter lists, function signatures, or union
 * types), by allowing between tokens of `text` (where a token is a maximal run
 * of word characters, or a single non-word character): - an optional trailing
 * comma (oxfmt adds one before a wrapped closing paren/bracket that isn't
 * present in the single-line form), - an optional JSDoc line-continuation `*`
 * (oxfmt reflows doc-comment prose, so a phrase authored on one line may get
 * split across lines with a `*` comment gutter inserted at the wrap point —
 * e.g. `less than\n * second argument`), and - after `unionStartTokens`, an
 * optional extra `|` (oxfmt's multiline union style prefixes EVERY member,
 * including the first, with `| ` on its own line — one more `|` than the
 * single-line form has). The extra `|` is only offered after `unionStartTokens`
 * (rather than between every token pair) to keep the generated regex
 * proportional to the punctuation density of `text` instead of its raw length —
 * offering it everywhere roughly doubles pattern size and can blow up regex
 * compilation for long doc-comment-laden patterns (e.g. a whole interface
 * body).
 */
const flexibleWhitespaceRegExp = (text: string): RegExp => {
  const tokens = tokenize(text);

  const pattern = tokens
    .map((token, i) => {
      const escaped = escapeToken(token);

      const prev = tokens[i - 1];

      const glue =
        prev !== undefined && unionStartTokens.has(prev)
          ? String.raw`,?\s*\|?\s*`
          : String.raw`,?\s*`;

      return i === 0 ? escaped : glue + escaped;
    })
    .join('');

  // Dropping whitespace during tokenization also drops any word boundary
  // that the original (untokenized) leading/trailing whitespace used to
  // provide. Without restoring it, a pattern like `'  var '` degrades to a
  // bare `var` regex that matches inside unrelated identifiers such as
  // `variant`. Middle tokens don't need this: two word-char runs can never
  // be adjacent in the token stream (tokenize always merges a maximal
  // word-char run into a single token), so a word token in the middle is
  // already bounded by whatever punctuation token follows/precedes it.
  const firstToken = tokens[0];

  const lastToken = tokens.at(-1);

  const leadingBoundary =
    firstToken !== undefined && wordChar.test(firstToken.charAt(0))
      ? String.raw`\b`
      : '';

  const trailingBoundary =
    lastToken !== undefined && wordChar.test(lastToken.at(-1) ?? '')
      ? String.raw`\b`
      : '';

  return new RegExp(leadingBoundary + pattern + trailingBoundary, 'gu');
};
