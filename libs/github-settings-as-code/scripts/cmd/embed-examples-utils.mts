import { pipe } from 'ts-data-forge';

const ignoreAboveKeyword = '// embed-sample-code-ignore-above';

const ignoreBelowKeyword = '// embed-sample-code-ignore-below';

const ignoreLineKeyword = '/* embed-sample-code-ignore-this-line */';

/** Extracts the relevant sample code, removing ignore markers */
export const extractSampleCode = (content: string): string => {
  const startIndex = content.indexOf(ignoreAboveKeyword);

  const endIndex = content.indexOf(ignoreBelowKeyword);

  const start = startIndex === -1 ? 0 : startIndex + ignoreAboveKeyword.length;

  const end = endIndex === -1 ? content.length : endIndex;

  return pipe(content.slice(start, end))
    .map((s) =>
      s
        .split('\n')
        .filter((line) => !line.trimStart().startsWith(ignoreLineKeyword))
        .join('\n'),
    )
    .map(normalizeIndent)
    .map((s) => s.trim()).value;
};

const normalizeIndent = (source: string): string => {
  const lines = source.split('\n');

  // Get the indentation of a line excluding blank lines
  const indents = lines
    .filter((line) => line.length > 0)
    .map((line) => {
      const match = /^ */u.exec(line);

      return match !== null ? match[0].length : 0;
    });

  if (indents.length === 0) {
    return source;
  }

  const minIndent = Math.min(...indents);

  return lines.map((line) => line.slice(minIndent)).join('\n');
};
