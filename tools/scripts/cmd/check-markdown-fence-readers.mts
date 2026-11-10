import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';

/**
 * Fails when a module under `tools/` writes its own regular expression for a
 * Markdown code fence instead of reading lines through `markdownLines`.
 *
 * Every guard that has to tell code from prose in a document reads fences
 * through `markdownLines` in {@link MARKDOWN_MODULE}, so that a fix to how a
 * fence opens or closes (one with an info string, one in a blockquote, CRLF
 * lines) reaches them all. A copy written beside a guard misses each later fix
 * and says nothing; two such copies had drifted apart before this check.
 *
 * What it looks for is a regular expression — a literal, or a string handed to
 * `new RegExp` — whose source names a run of three backticks or tildes. Test
 * files are left alone: they build fences as data, not to read one.
 */
export const checkMarkdownFenceReaders = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const files = tracked.value.filter(isCheckedModule);

  const mut_found: FoundRegex[] = [];

  for (const file of files) {
    const text = await readRepositoryFile(file);

    if (Result.isErr(text)) {
      return Result.err(`❌ ${text.value}`);
    }

    mut_found.push(
      ...findFenceRegexes(text.value).map((found) => ({ file, ...found })),
    );
  }

  const { offenders, staleExemptions } = judgeFenceRegexes(
    mut_found,
    NOT_FENCE_READERS,
  );

  return Arr.isNonEmpty(offenders) || Arr.isNonEmpty(staleExemptions)
    ? Result.err(
        [
          ...(Arr.isNonEmpty(offenders)
            ? [
                `❌ ${offenders.length} regular expression(s) under tools/ read a Markdown code fence by hand:`,
                '',
                ...offenders.map(
                  ({ file, line, source }) => `  ${file}:${line}: ${source}`,
                ),
                '',
                `Read the document's lines with \`markdownLines\` from ${MARKDOWN_MODULE},`,
                'which says which lines are fenced, and teach that module what it',
                'does not read yet, so that every guard reads fences one way.',
                'A regular expression that names a fence without reading where',
                'one opens and closes goes in NOT_FENCE_READERS, with the reason.',
              ]
            : []),
          ...(Arr.isNonEmpty(staleExemptions)
            ? [
                '❌ NOT_FENCE_READERS names regular expressions no module has; remove them:',
                '',
                ...staleExemptions.map(
                  ({ file, source }) => `  ${file}: ${source}`,
                ),
              ]
            : []),
        ].join('\n'),
      )
    : Result.ok(files.length);
};

/**
 * The regular expressions found that no {@link NOT_FENCE_READERS} entry exempts,
 * and the entries that exempt none, which would otherwise outlive their
 * reasons.
 */
export const judgeFenceRegexes = (
  found: readonly FoundRegex[],
  exemptions: readonly Exemption[],
): Readonly<{
  offenders: readonly FoundRegex[];
  staleExemptions: readonly Exemption[];
}> => {
  const matches = (exemption: Exemption, regex: FoundRegex): boolean =>
    exemption.file === regex.file && exemption.source === regex.source;

  return {
    offenders: found.filter((regex) =>
      exemptions.every((exemption) => !matches(exemption, regex)),
    ),
    staleExemptions: exemptions.filter((exemption) =>
      found.every((regex) => !matches(exemption, regex)),
    ),
  };
};

/**
 * Each regular expression in a module whose source names a fence: a run of
 * three backticks or tildes, written out or as a `{3,}` repetition.
 */
export const findFenceRegexes = (
  sourceText: string,
): readonly Readonly<{ line: number; source: string }>[] => {
  const sourceFile = ts.createSourceFile(
    'module.mts',
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  return Arr.generate(function* () {
    const mut_stack: ts.Node[] = [sourceFile];

    while (Arr.isNonEmpty(mut_stack)) {
      const node = mut_stack.pop();

      if (node === undefined) {
        break;
      }

      const source = regexSourceOf(node);

      if (source !== undefined && FENCE_IN_SOURCE.test(source)) {
        yield {
          line:
            sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          source: node.getText(),
        };
      }

      mut_stack.push(...node.getChildren());
    }
  }).toSorted((a, b) => a.line - b.line);
};

export type FoundRegex = Readonly<{
  /** Repository-relative. */
  file: string;
  line: number;
  /** The expression as written. */
  source: string;
}>;

export type Exemption = Readonly<{
  file: string;
  /** The expression exactly as written, so a new one beside it is still read. */
  source: string;
  reason: string;
}>;

/** Three backticks, which a template literal cannot hold unescaped. */
const FENCE = '`'.repeat(3);

/**
 * Regular expressions that name a fence without reading where one opens and
 * closes, each with why it stays.
 */
const NOT_FENCE_READERS: readonly Exemption[] = [
  {
    file: 'tools/configs/embed-examples-in-markdown.mts',
    source: String.raw`/^([ \t]*)${FENCE}(?:ts|tsx|mts|cts|typescript|js|jsx|mjs|cjs|javascript)(?=\s|$)/mu`,
    reason:
      "Finds the start of each JavaScript or TypeScript sample by its language tag, to replace its body; `markdownLines` says which lines are fenced, not a fence's info string or its body.",
  },
  {
    file: 'tools/configs/embed-examples-in-markdown.mts',
    source: String.raw`/\n[ \t]*${FENCE}/u`,
    reason:
      'The end of the sample body the expression above found, which the embedding replaces.',
  },
  {
    file: 'tools/scripts/cmd/check-markdown-wrap/paragraphs.mts',
    source: String.raw`/^(?:[-*+|]$|>|<|#|\[[^\]]+\]:|=+$|-+$|\d+[.)]$|${FENCE}|~~~|:::)/u`,
    reason:
      'Words a refill must not put at the start of a line, a fence among them; which lines are fenced is read with `markdownLines`.',
  },
] as const;

/** The module every fence is read through, exempt from the check. */
const MARKDOWN_MODULE = 'tools/scripts/lib/markdown.mts';

/**
 * Three backticks or tildes in a regular expression's source: written out,
 * escaped or not (`` ``` ``, ``\`\`\` ``), or repeated (`` `{3,} ``).
 */
// eslint-disable-next-line security/detect-unsafe-regex -- a fixed-length repetition of an optional character; nothing to backtrack
const FENCE_IN_SOURCE = /(?:\\?`){3}|(?:\\?~){3}|[`~]\{3/u;

const isCheckedModule = (file: string): boolean =>
  file.startsWith('tools/') &&
  /\.[cm]?ts$/u.test(file) &&
  !/\.test\.[cm]?ts$/u.test(file) &&
  file !== MARKDOWN_MODULE;

/**
 * The source of a regular expression the node is: a literal's text, or the text
 * of the string literal handed to `new RegExp` / `RegExp`.
 */
const regexSourceOf = (node: ts.Node): string | undefined => {
  if (ts.isRegularExpressionLiteral(node)) {
    return node.text;
  }

  if (
    (ts.isNewExpression(node) || ts.isCallExpression(node)) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'RegExp'
  ) {
    const [first] = node.arguments ?? [];

    return first !== undefined &&
      (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first))
      ? first.text
      : undefined;
  }

  return undefined;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkMarkdownFenceReaders().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} module(s) under tools/ read Markdown fences only through ${MARKDOWN_MODULE}.`,
  );
}
