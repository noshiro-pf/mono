import { Result } from 'ts-data-forge';
import { formatFiles } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
import { sourceFileMappings } from './embed-examples-in-jsdoc-map.mjs';
import { extractSampleCode } from './embed-examples-utils.mjs';

const codeBlockStart = '```ts';

const codeBlockEnd = '```';

/**
 * Embeds sample code from samples/src into JSDoc @example code blocks in src
 * files. Replaces code blocks sequentially in the order defined in
 * sourceFileMappings.
 */
export const embedExamplesInJsDoc = async (): Promise<
  Result<undefined, unknown>
> => {
  try {
    const mut_modifiedFiles: string[] = [];

    for (const { sampleFiles, sourcePath } of sourceFileMappings) {
      const sourceFilePath = path.resolve(projectRootPath, sourcePath);

      const sourceContent = await fs.readFile(sourceFilePath, 'utf8');

      const mut_results: string[] = [];

      let mut_rest: string = sourceContent;

      for (const sampleFile of sampleFiles) {
        const samplePath = path.resolve(projectRootPath, sampleFile);

        // Read sample content
        const sampleContent = await fs.readFile(samplePath, 'utf8');

        const sampleContentSliced = extractSampleCode(sampleContent);

        // Find next code block
        const codeBlockStartIndex = mut_rest.indexOf(codeBlockStart);

        if (codeBlockStartIndex === -1) {
          return Result.err(
            `❌ Code block start not found for ${sampleFile} in ${sourcePath}`,
          );
        }

        const codeBlockEndIndex = mut_rest.indexOf(
          codeBlockEnd,
          codeBlockStartIndex + codeBlockStart.length,
        );

        if (codeBlockEndIndex === -1) {
          return Result.err(
            `❌ Code block end not found for ${sampleFile} in ${sourcePath}`,
          );
        }

        // Replace the code block content
        const beforeBlock = mut_rest.slice(
          0,
          Math.max(0, codeBlockStartIndex + codeBlockStart.length),
        );

        const afterBlock = mut_rest.slice(Math.max(0, codeBlockEndIndex));

        // Indent the sample code to match JSDoc style (3 spaces + ' * ')
        const indentedSampleCode = sampleContentSliced
          .split('\n')
          .map((line) => (line.trim() === '' ? '   *' : `   * ${line}`))
          .join('\n');

        mut_results.push(beforeBlock, '\n', indentedSampleCode, '\n   * ');

        mut_rest = afterBlock;

        console.log(
          `✓ Updated code block for ${sampleFile} in ${path.relative(projectRootPath, sourceFilePath)}`,
        );
      }

      mut_results.push(mut_rest);

      // Write updated source file
      const updatedContent = mut_results.join('');

      await fs.writeFile(sourceFilePath, updatedContent, 'utf8');

      mut_modifiedFiles.push(sourceFilePath);
    }

    if (mut_modifiedFiles.length > 0) {
      console.log(`\nFormatting ${mut_modifiedFiles.length} modified files...`);

      await formatFiles(mut_modifiedFiles);

      console.log('✓ Formatting completed');
    }

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(`❌ Failed to embed JSDoc examples: ${String(error)}`);
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedExamplesInJsDoc();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
