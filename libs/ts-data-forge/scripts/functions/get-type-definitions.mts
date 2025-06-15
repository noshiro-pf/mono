import '../node-global.mjs';
import { ensurePathExists } from '../utils.mjs';

const CONFIG = {
  srcDir: path.resolve(projectRootPath, './src'),
  readmePath: path.resolve(projectRootPath, './README.md'),
  typeRegex: /^type ([^< =]*)/u,
  namespaceRegex: /^declare namespace ([^ {]*)/u,
  markers: {
    start: '<!-- AUTO-GENERATED TYPES START -->',
    end: '<!-- AUTO-GENERATED TYPES END -->',
  },
  excludedNamespace: 'TSTypeForgeInternals',
} as const;

/**
 * Represents a type definition found in a file.
 */
type TypeDefinition = Readonly<{
  typeName: string;
  filePath: string;
  line: number;
}>;

/**
 * Processes a single file to find type definitions matching the regex.
 * @param filePath - The path to the file.
 * @returns Promise resolving to found types.
 * @throws Error if file processing fails.
 */
const processFile = async (
  filePath: string,
): Promise<readonly TypeDefinition[]> => {
  const results: TypeDefinition[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(projectRootPath, filePath);

    // Process type definitions
    for (const [index, line] of lines.entries()) {
      const match = CONFIG.typeRegex.exec(line);
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

    // Process namespace declarations
    for (const [_index, line] of lines.entries()) {
      const namespaceMatch = CONFIG.namespaceRegex.exec(line);
      if (
        namespaceMatch?.[1] !== undefined &&
        namespaceMatch[1] !== CONFIG.excludedNamespace
      ) {
        // Find types within this namespace
        for (const [idx, l] of lines.entries()) {
          const typeMatch = CONFIG.typeRegex.exec(l.trimStart());
          if (typeMatch?.[1] !== undefined) {
            results.push({
              typeName: `${namespaceMatch[1]}.${typeMatch[1]}`,
              filePath: relativePath,
              line: idx + 1,
            });
          }
        }
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Error processing file ${filePath}: ${String(error)}`);
  }
};

/**
 * Generates type definitions list and updates the README file.
 * @throws Error if any step fails.
 */
export const genTypeDefinitions = async (): Promise<void> => {
  echo('Starting type definitions generation...\n');

  try {
    // Step 1: Verify source directory and README file exist
    await ensurePathExists(CONFIG.srcDir, 'Source directory');
    await ensurePathExists(CONFIG.readmePath, 'README file');

    // Step 2: Find all TypeScript definition files
    echo('1. Finding TypeScript definition files...');
    const dtsFiles = await glob(`${CONFIG.srcDir}/**/*.d.mts`);
    echo(`✓ Found ${dtsFiles.length} definition files\n`);

    // Step 3: Process files to extract type definitions
    echo('2. Processing files for type definitions...');
    const allTypes = await Promise.all(
      dtsFiles.toSorted().map(async (file) => {
        try {
          return await processFile(file);
        } catch (error) {
          echo(`Warning: Failed to process ${file}: ${String(error)}`);
          return [];
        }
      }),
    );
    echo('✓ Type definitions extracted\n');

    // Step 4: Generate markdown content
    echo('3. Generating markdown content...');
    const typeDefinitions = allTypes.flat();
    const result = typeDefinitions
      .map(
        ({ typeName, filePath, line }) =>
          `- [${typeName}](./${filePath}#L${line})`,
      )
      .join('\n');
    echo(`✓ Generated content for ${typeDefinitions.length} types\n`);

    // Step 5: Update README file
    echo('4. Updating README file...');
    const content = await fs.readFile(CONFIG.readmePath, 'utf-8');

    const pattern = new RegExp(
      `${CONFIG.markers.start}[.\\s\\S]*${CONFIG.markers.end}`,
      'gu',
    );
    const newContent = content.replace(
      pattern,
      `${CONFIG.markers.start}\n${result}\n\n${CONFIG.markers.end}`,
    );

    await fs.writeFile(CONFIG.readmePath, newContent, 'utf-8');
    echo('✓ README file updated\n');

    echo('✅ Type definitions generation completed successfully!\n');
  } catch (error) {
    echo(`❌ Type definitions generation failed: ${String(error)}\n`);
    throw error;
  }
};
