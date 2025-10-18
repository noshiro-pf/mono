const ignoreAboveKeyword = '// embed-sample-code-ignore-above';
const ignoreBelowKeyword = '// embed-sample-code-ignore-below';

/** Extracts the relevant sample code, removing ignore markers */
export const extractSampleCode = (content: string): string => {
  const startIndex = content.indexOf(ignoreAboveKeyword);

  const endIndex = content.indexOf(ignoreBelowKeyword);

  const start = startIndex === -1 ? 0 : startIndex + ignoreAboveKeyword.length;

  const end = endIndex === -1 ? content.length : endIndex;

  return content
    .slice(start, end)
    .replaceAll(/IGNORE_EMBEDDING\(.*\);\n/gu, '')
    .trim();
};
