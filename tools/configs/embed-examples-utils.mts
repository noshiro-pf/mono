import { Arr, pipe } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';

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

/**
 * Extracts the part of a sample file that is embedded, removing the markers.
 *
 * `// embed-sample-code-ignore-above` and `// embed-sample-code-ignore-below`
 * each sit on a line of their own and may be used any number of times, so a
 * sample can show several ranges and hide the scaffolding between them. A
 * stretch of lines is hidden when the marker before it is `ignore-below` or the
 * marker after it is `ignore-above`; the start and the end of the file count as
 * neither. Each range left loses the indentation common to its own lines, and
 * the ranges are joined by a blank line.
 * `/* embed-sample-code-ignore-this-line *\/` drops a single line wherever it
 * is.
 *
 * Two markers of the same kind in a row are an error rather than a guess at
 * what was meant.
 */
export const extractSampleCode = (
  content: string,
  { stripTransformerDirectives = false }: ExtractSampleCodeOptions = {},
): string => {
  const ignoreLineKeywords = stripTransformerDirectives
    ? [ignoreLineKeyword, transformerIgnoreLineKeyword]
    : [ignoreLineKeyword];

  const lines = content.split('\n');

  const markers = lines.flatMap((line, index): readonly Marker[] => {
    const trimmed = line.trimStart();

    return trimmed.startsWith(ignoreAboveKeyword)
      ? [{ index, kind: 'above' }]
      : trimmed.startsWith(ignoreBelowKeyword)
        ? [{ index, kind: 'below' }]
        : [];
  });

  for (const [previous, next] of adjacentPairs(markers)) {
    if (previous.kind === next.kind) {
      throw new Error(
        `two embed-sample-code-ignore-${next.kind} markers in a row, on lines ${previous.index + 1} and ${next.index + 1}; close the range between them with the other marker`,
      );
    }
  }

  const bounds: readonly Marker[] = [
    { index: -1, kind: undefined },
    ...markers,
    { index: lines.length, kind: undefined },
  ];

  return adjacentPairs(bounds)
    .filter(([start, end]) => start.kind !== 'below' && end.kind !== 'above')
    .map(
      ([start, end]) =>
        pipe(
          lines
            .slice(start.index + 1, end.index)
            .filter((line) =>
              ignoreLineKeywords.every(
                (keyword) => !line.trimStart().startsWith(keyword),
              ),
            )
            .join('\n'),
        )
          .map(normalizeIndent)
          .map((s) => s.trim()).value,
    )
    .filter((range) => range !== '')
    .join('\n\n');
};

/** Each element with the one after it: `[a, b, c]` gives `[a, b]`, `[b, c]`. */
const adjacentPairs = <T,>(
  xs: readonly T[],
): readonly FixedLengthTuple<2, T>[] =>
  xs.flatMap((x, index) => {
    const next = xs[index + 1];

    return next === undefined ? [] : [[x, next] as const];
  });

/** A marker line, or (with no kind) the start or the end of the file. */
type Marker = Readonly<{
  index: number;
  kind: 'above' | 'below' | undefined;
}>;

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
