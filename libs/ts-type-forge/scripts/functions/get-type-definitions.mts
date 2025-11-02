import { projectRootPath } from '../project-root-path.mjs';

const srcDir = path.resolve(projectRootPath, './src');

const readmePath = path.resolve(projectRootPath, './README.md');

const typeRegex = /^type ([^< =]*)/u;
const namespaceRegex = /^declare namespace ([^ {]*)/u;

const markers = {
  start: '<!-- AUTO-GENERATED TYPES START -->',
  end: '<!-- AUTO-GENERATED TYPES END -->',
} as const;

const TSTypeForgeInternals = 'TSTypeForgeInternals';

/**
 * Processes a single file to find type definitions matching the regex.
 */
const processFile = async (
  filePath: string,
): Promise<
  DeepReadonly<{
    relativePath: string;
    types: { typeName: string; line: number }[];
  }>
> => {
  const mut_results: Readonly<{
    typeName: string;
    line: number;
  }>[] = [];

  const relativePath = path.relative(projectRootPath, filePath);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');

    for (const [index, line] of lines.entries()) {
      {
        const match = typeRegex.exec(line);
        if (match?.[1] !== undefined) {
          // Exclude internal namespace helper types if needed (adjust regex if necessary)
          // For now, just matching the pattern
          mut_results.push({
            typeName: match[1],
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
              mut_results.push({
                typeName: `${namespaceMatch[1]}.${typeMatch[1]}`,
                line: idx + 1,
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
  return {
    relativePath,
    types: mut_results,
  };
};

export const genTypeDefinitions = async (): Promise<void> => {
  const dtsFiles = await glob(`${srcDir}/**/*.d.mts`);

  const allTypes: DeepReadonly<
    {
      relativePath: string;
      types: { typeName: string; line: number }[];
    }[]
  > = await Promise.all(dtsFiles.toSorted().map(processFile));

  const result = allTypes
    .flatMap(({ relativePath, types }) => [
      `- ${relativePath}`,
      ...types.map(
        ({ line, typeName }) => `  - [${typeName}](./${relativePath}#L${line})`,
      ),
    ])
    .join('\n');

  const content = await fs.readFile(readmePath, 'utf8');

  const newContent = content.replaceAll(
    // eslint-disable-next-line security/detect-non-literal-regexp
    new RegExp(String.raw`${markers.start}[.\s\S]*${markers.end}`, 'gu'),
    `${markers.start}\n${result}\n\n${markers.end}`,
  );

  // Write the updated content back to the README file
  await fs.writeFile(readmePath, newContent, 'utf8');
};
