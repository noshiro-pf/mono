import '../node-global.mjs';

const srcDir = path.resolve(projectRootPath, './src');

const readmePath = path.resolve(projectRootPath, './README.md');

const typeRegex = /^type ([^< =]*)/u;
const namespaceRegex = /^declare namespace ([^ {]*)/u;

const markers = {
  start: '<!-- AUTO-GENERATED TYPES START -->',
  end: '<!-- AUTO-GENERATED TYPES END -->',
};

const TSTypeForgeInternals = 'TSTypeForgeInternals';

/**
 * Processes a single file to find type definitions matching the regex.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<{ typeName: string; filePath: string; line: number }[]>} - A promise resolving to found types.
 */
const processFile = async (
  filePath: string,
): Promise<
  DeepReadonly<{ typeName: string; filePath: string; line: number }[]>
> => {
  const results: Readonly<{
    typeName: string;
    filePath: string;
    line: number;
  }>[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(projectRootPath, filePath);

    for (const [index, line] of lines.entries()) {
      {
        const match = typeRegex.exec(line);
        if (match?.[1] !== undefined) {
          // Exclude internal namespace helper types if needed (adjust regex if necessary)
          // For now, just matching the pattern
          results.push({
            typeName: match[1],
            filePath: relativePath,
            line: index + 1,
          });
        }
      }
      {
        const namespaceMatch = namespaceRegex.exec(line);
        if (
          namespaceMatch?.[1] !== undefined &&
          namespaceMatch[1] !== TSTypeForgeInternals // Exclude TSTypeForgeInternals namespace
        ) {
          for (const [idx, l] of lines.entries()) {
            const typeMatch = typeRegex.exec(l.trimStart());
            if (typeMatch?.[1] !== undefined) {
              // Exclude internal namespace helper types if needed (adjust regex if necessary)
              // For now, just matching the pattern
              results.push({
                typeName: `${namespaceMatch[1]}.${typeMatch[1]}`,
                filePath: relativePath,
                line: idx + 1,
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
  }
  return results;
};

export const genTypeDefinitions = async (): Promise<void> => {
  const dtsFiles = await glob(`${srcDir}/**/*.d.mts`);

  const allTypes: DeepReadonly<
    { typeName: string; filePath: string; line: number }[][]
  > = await Promise.all(dtsFiles.toSorted().map((file) => processFile(file)));

  const result = allTypes
    .flat(1)
    .map(
      ({ typeName, filePath, line }) =>
        `- [${typeName}](./${filePath}#L${line})`,
    )
    .join('\n');

  const content = await fs.readFile(readmePath, 'utf-8');

  const newContent = content.replace(
    new RegExp(`${markers.start}[.\\s\\S]*${markers.end}`, 'gu'),
    `${markers.start}\n${result}\n\n${markers.end}`,
  );

  // Write the updated content back to the README file
  await fs.writeFile(readmePath, newContent, 'utf-8');
};
