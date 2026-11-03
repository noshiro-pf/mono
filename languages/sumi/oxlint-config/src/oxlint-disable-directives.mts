import type { MarkerProblem } from './expect-error-markers.mjs';
import { oxlintCodeToRuleId } from './rule-id-mapping.mjs';

/**
 * The `oxlint-disable*` comments in `sourceText` that silence a rule of the
 * Sumi preset, each as a problem for `sumi check` to report (D-60).
 *
 * `respectEslintDisableDirectives: false` keeps `eslint-disable*` from
 * answering a Sumi diagnostic, but `oxlint-disable*` is oxlint's own directive,
 * which no option turns off. So a directive is reported when oxlint would apply
 * it to a rule the preset enables: when it names no rule (it then silences all
 * of them), or names one whose last segment is a preset rule's name — oxlint
 * matches a rule by that segment alone, so
 * `total-functions/no-unsafe-type-assertion` silences
 * `typescript(no-unsafe-type-assertion)`. A directive naming only other rules
 * is left alone: the repository disables a rule moved from ESLint to oxlint
 * that way (`tools/configs/oxlint-rules.mts`).
 *
 * A comment is text after `//`, up to the end of its line, or after `/*`, up to
 * the `*\/` that closes it on whichever line that is, whose first word, after
 * the whitespace oxlint trims (newlines included), is the directive; it is
 * reported on the line it starts on. A string that holds such text is read as
 * one too, which errs towards reporting.
 */
export const findSumiSilencingDirectives = (
  sourceText: string,
): readonly MarkerProblem[] =>
  directiveComments(sourceText).flatMap(
    ({ body, line }): readonly MarkerProblem[] => {
      const directive = parseDirective(body);

      if (directive === undefined) {
        return [];
      }

      const { keyword, ruleNames } = directive;

      if (ruleNames.length === 0) {
        return [
          {
            line,
            message: `\`${keyword}\` names no rule, so it silences every rule \`sumi check\` enforces. Use \`// @sumi-expect-error <rule-id>\` instead (D-60).`,
          },
        ];
      }

      const silenced = ruleNames.flatMap((name) => {
        const lastSegment = name.slice(name.lastIndexOf('/') + 1);

        const presetRule = presetRulesByName.get(lastSegment);

        return presetRule === undefined ? [] : [presetRule];
      });

      return silenced.length === 0
        ? []
        : [
            {
              line,
              message: `\`${keyword}\` silences ${silenced
                .map(({ code }) => `\`${code}\``)
                .join(', ')}, which \`sumi check\` enforces. Use ${silenced
                .map(({ ruleId }) => `\`// @sumi-expect-error ${ruleId}\``)
                .join(', ')} instead (D-60).`,
            },
          ];
    },
  );

type PresetRule = Readonly<{ code: string; ruleId: string }>;

/** The preset's rules by the rule name inside their code (`sumi(no-throw)` → `no-throw`). */
const presetRulesByName: ReadonlyMap<string, PresetRule> = new Map(
  Array.from(oxlintCodeToRuleId).flatMap(([code, ruleId]) => {
    const name = /^[^()]+\(([^()]+)\)$/u.exec(code)?.[1];

    return name === undefined ? [] : [[name, { code, ruleId }] as const];
  }),
);

/**
 * Each comment in `sourceText` whose text starts with `oxlint-disable` once the
 * leading whitespace is trimmed, with the line its `//` or `/*` is on: its text
 * up to the line terminator that ends a line comment, or up to the `*\/` that
 * closes a block comment, on whichever line that is (to the end of the source
 * when none does). Every `/` followed by `/` or `*` opens one, so the `/` of a
 * `*\/` does not hide a comment opened straight after it, save the second `/`
 * of a `//`, which `///` would otherwise read as a comment of its own.
 */
const directiveComments = (
  sourceText: string,
): readonly Readonly<{ body: string; line: number }>[] => {
  // Lines are counted from the previous directive, as the matches come in order.
  let mut_line = 1;

  let mut_counted = 0;

  return Array.from(sourceText.matchAll(/\/(?=[/*])/gu)).flatMap((match) => {
    if (
      sourceText[match.index - 1] === '/' &&
      sourceText[match.index - 2] !== '*'
    ) {
      return [];
    }

    const rest = sourceText.slice(match.index + 2);

    // Only the leading whitespace is read before the rest is known to matter.
    if (!rest.trimStart().startsWith('oxlint-disable')) {
      return [];
    }

    const end =
      sourceText[match.index + 1] === '/'
        ? rest.search(/[\n\r\u{2028}\u{2029}]/u)
        : rest.indexOf('*/');

    mut_line +=
      sourceText.slice(mut_counted, match.index).split('\n').length - 1;

    mut_counted = match.index;

    return [
      {
        body: end === -1 ? rest : rest.slice(0, end),
        line: mut_line,
      },
    ];
  });
};

type Directive = Readonly<{ keyword: string; ruleNames: readonly string[] }>;

const directiveKeywords = [
  'oxlint-disable-next-line',
  'oxlint-disable-line',
  'oxlint-disable',
] as const;

/**
 * The directive `body` is, or `undefined` when it is not one: its keyword and
 * the rules it names, with a `-- reason` left out.
 */
const parseDirective = (body: string): Directive | undefined => {
  const trimmed = body.trim();

  const keyword = directiveKeywords.find(
    (k) =>
      trimmed === k ||
      (trimmed.startsWith(k) && /\s/u.test(trimmed.at(k.length) ?? '')),
  );

  if (keyword === undefined) {
    return undefined;
  }

  const rest = trimmed.slice(keyword.length);

  const reasonIndex = rest.indexOf('--');

  const ruleList = reasonIndex === -1 ? rest : rest.slice(0, reasonIndex);

  return {
    keyword,
    ruleNames: ruleList
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name !== ''),
  };
};
