import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * The plural forms of a message, by the plural category of `Intl.PluralRules`.
 * `other` is required, since every locale has it; a category left out falls
 * back to it. `#` in a form is the count, written as a number in the locale.
 */
export type PluralForms = Readonly<
  Partial<ReadonlyRecord<Intl.LDMLPluralRule, string>> & { other: string }
>;

/**
 * A plural chooser for `locale`, for the function messages of that locale's
 * catalog. It picks the form of `count` by the locale's plural rules:
 * `plural('en')(1, { one: '# answer', other: '# answers' })` is `'1 answer'`.
 */
export const plural = (
  locale: string,
): ((count: number, forms: PluralForms) => string) => {
  const rules = new Intl.PluralRules(locale);

  const numbers = new Intl.NumberFormat(locale);

  return (count, forms) => {
    const written = numbers.format(count);

    return (forms[rules.select(count)] ?? forms.other).replaceAll(
      '#',
      () => written,
    );
  };
};

/**
 * The locale of `supported` that best matches the user's preferences
 * `requested` (most preferred first, as `navigator.languages` lists them), or
 * `fallback`. Each requested tag is tried in turn, first as it is and then
 * shortened a subtag at a time (`zh-Hant-TW`, `zh-Hant`, `zh`), as RFC 4647's
 * lookup does, which drops a single-character subtag (`x`, `u`) together with
 * the one after it; case is ignored, and an underscore reads as a hyphen
 * (`en_US`).
 */
export const negotiateLocale = <const L extends string>(
  requested: readonly string[],
  supported: readonly L[],
  fallback: NoInfer<L>,
): L => {
  // Keyed by the tag in lower case, and as requested tags are shortened: lower
  // case, subtags joined by `-`. Of two tags that read the same, such as
  // `en_US` and `en-US`, the first wins, save that a tag matching as it is wins
  // over one matching once an underscore is read as a hyphen.
  const mut_byLowerCase = new Map<string, L>();

  const mut_bySubtags = new Map<string, L>();

  for (const l of supported) {
    const lower = l.toLowerCase();

    const subtags = lower.replaceAll('_', '-');

    if (!mut_byLowerCase.has(lower)) {
      mut_byLowerCase.set(lower, l);
    }

    if (!mut_bySubtags.has(subtags)) {
      mut_bySubtags.set(subtags, l);
    }
  }

  for (const tag of requested) {
    const asIs = mut_byLowerCase.get(tag.toLowerCase());

    if (asIs !== undefined) {
      return asIs;
    }

    // An underscore, as some platforms write `en_US`, separates subtags too.
    const subtags = tag.toLowerCase().split(/[-_]/u);

    for (let mut_length = subtags.length; mut_length > 0; mut_length -= 1) {
      // A shortened form that ends in a single-character subtag is not tried
      // (RFC 4647, 3.4); the whole tag always is.
      if (
        mut_length < subtags.length &&
        subtags[mut_length - 1]?.length === 1
      ) {
        continue;
      }

      const hit = mut_bySubtags.get(subtags.slice(0, mut_length).join('-'));

      if (hit !== undefined) {
        return hit;
      }
    }
  }

  return fallback;
};
