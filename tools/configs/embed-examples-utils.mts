import { Arr, pipe } from 'ts-data-forge';

export type ExtractSampleCodeOptions = Readonly<{
  /**
   * Also drop lines that open with `// transformer-ignore-next-line`. The
   * synstate family and `apps/synstate-docs` want that — the codemod
   * directives their samples carry are noise in a rendered document — and it
   * cannot be unconditional, because `ts-codemod-lib`'s samples are _about_
   * that directive and stripping it would gut them.
   */
  stripTransformerDirectives?: boolean;
}>;

/** Extracts the relevant sample code, removing ignore markers */
export const extractSampleCode = (
  content: string,
  { stripTransformerDirectives = false }: ExtractSampleCodeOptions = {},
): string => {
  const ignoreLineKeywords = stripTransformerDirectives
    ? [ignoreLineKeyword, transformerIgnoreLineKeyword]
    : [ignoreLineKeyword];

  const startIndex = content.indexOf(ignoreAboveKeyword);

  const endIndex = content.indexOf(ignoreBelowKeyword);

  const start = startIndex === -1 ? 0 : startIndex + ignoreAboveKeyword.length;

  const end = endIndex === -1 ? content.length : endIndex;

  return pipe(content.slice(start, end))
    .map((s) =>
      s
        .split('\n')
        .filter((line) =>
          ignoreLineKeywords.every(
            (keyword) => !line.trimStart().startsWith(keyword),
          ),
        )
        .join('\n'),
    )
    .map(normalizeIndent)
    .map((s) => s.trim()).value;
};

const ignoreAboveKeyword = '// embed-sample-code-ignore-above';

const ignoreBelowKeyword = '// embed-sample-code-ignore-below';

const ignoreLineKeyword = '/* embed-sample-code-ignore-this-line */';

const transformerIgnoreLineKeyword = '// transformer-ignore-next-line';

const normalizeIndent = (source: string): string => {
  const lines = source.split('\n');

  // Get the indentation of a line excluding blank lines
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const match = /^ */u.exec(line);

      return match !== null ? match[0].length : 0;
    });

  // `Math.min()` of nothing would be Infinity, and the slice below would eat
  // every line.
  if (Arr.isEmpty(indents)) {
    return source;
  }

  const minIndent = Math.min(...indents);

  return lines.map((line) => line.slice(minIndent)).join('\n');
};
