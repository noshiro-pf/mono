import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, unknownToString } from 'ts-data-forge';
import { formatFiles, glob, isDirectlyExecuted, Result } from 'ts-repo-utils';
import { workspaceRootPath } from '../workspace-root-path.mjs';
import { sourceFileMappings } from './embed-examples-in-jsdoc-map.mjs';
import { extractSampleCode } from './embed-examples-utils.mjs';

const codeBlockStart = '```ts';

const codeBlockEnd = '```';

/**
 * Embeds sample code from samples/src into JSDoc `@example` code blocks in
 * src files. Replaces code blocks sequentially in the order defined in
 * sourceFileMappings, so sample files must be listed in the order their
 * `@example` blocks appear in the source file.
 *
 * Fails if any `@example` in src is not backed by a type-checked sample file
 * in samples/src — see {@link assertAllExamplesAreMapped}.
 */
export const embedExamplesInJsDoc = async (): Promise<
  Result<undefined, unknown>
> => {
  try {
    const coverageResult = await assertAllExamplesAreMapped();

    if (Result.isErr(coverageResult)) {
      return coverageResult;
    }

    const mut_modifiedFiles: string[] = [];

    for (const { sampleFiles, sourcePath } of sourceFileMappings) {
      const sourceFilePath = path.resolve(workspaceRootPath, sourcePath);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const sourceContent = await fs.readFile(sourceFilePath, 'utf8');

      const codeBlockCount = sourceContent.split(codeBlockStart).length - 1;

      if (codeBlockCount !== sampleFiles.length) {
        return Result.err(
          `❌ Code block count mismatch in ${sourcePath}: found ${codeBlockCount} \`\`\`ts blocks but expected ${sampleFiles.length} sample files`,
        );
      }

      const exampleTagCount = countExampleTags(sourceContent);

      if (exampleTagCount !== codeBlockCount) {
        return Result.err(
          [
            `❌ ${sourcePath} has ${exampleTagCount} \`@example\` tag(s) but only ${codeBlockCount} \`\`\`ts block(s).`,
            'An `@example` written as bare JSDoc lines is never type-checked and',
            'silently drifts. Move the snippet into a sample file under',
            'samples/src, leave a ```ts block in its place, and list the sample in',
            'scripts/cmd/embed-examples-in-jsdoc-map.mts.',
          ].join('\n'),
        );
      }

      const mut_results: string[] = [];

      let mut_rest: string = sourceContent;

      for (const sampleFile of sampleFiles) {
        const samplePath = path.resolve(workspaceRootPath, sampleFile);

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const sampleContent = await fs.readFile(samplePath, 'utf8');

        const sampleContentSliced = extractSampleCode(sampleContent);

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

        // The JSDoc line prefix of the opening fence line (e.g. ` * `),
        // reused to indent the embedded sample lines.
        const lineStartIndex =
          mut_rest.lastIndexOf('\n', codeBlockStartIndex) + 1;

        const linePrefix = mut_rest.slice(lineStartIndex, codeBlockStartIndex);

        const beforeBlock = mut_rest.slice(
          0,
          codeBlockStartIndex + codeBlockStart.length,
        );

        const afterBlock = mut_rest.slice(codeBlockEndIndex);

        const indentedSampleCode = sampleContentSliced
          .split('\n')
          .map((line) =>
            line.trim() === '' ? linePrefix.trimEnd() : `${linePrefix}${line}`,
          )
          .join('\n');

        mut_results.push(
          beforeBlock,
          '\n',
          indentedSampleCode,
          '\n',
          linePrefix,
        );

        mut_rest = afterBlock;

        console.info(`✓ Updated code block for ${sampleFile} in ${sourcePath}`);
      }

      mut_results.push(mut_rest);

      const updatedContent = mut_results.join('');

      if (updatedContent !== sourceContent) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(sourceFilePath, updatedContent, 'utf8');

        mut_modifiedFiles.push(sourceFilePath);
      }
    }

    if (Arr.isNonEmpty(mut_modifiedFiles)) {
      console.info(
        `\nFormatting ${mut_modifiedFiles.length} modified files...`,
      );

      await formatFiles(mut_modifiedFiles);

      console.info('✓ Formatting completed');
    }

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(
      `❌ Failed to embed JSDoc examples: ${unknownToString(error)}`,
    );
  }
};

/**
 * Number of `@example` JSDoc tags in a source file.
 *
 * The pattern is anchored to the ` * ` comment-line prefix rather than matching
 * the bare word, so prose mentioning `@example` (this file's own doc comments,
 * for instance) is not counted as a tag. It is also built per call: a `/g`
 * regex carries mutable `lastIndex` state, which a shared literal would leak
 * from one file to the next.
 */
const countExampleTags = (content: string): number =>
  Array.from(content.matchAll(/^\s*\*\s*@example\b/gmu)).length;

/**
 * Verifies that every `@example` under src is backed by a type-checked sample
 * file in samples/src, i.e. that its module is listed in sourceFileMappings.
 * Generated files (index.mts / global.mts / entry-point.mts) and tests are
 * exempt.
 *
 * The trigger is the `@example` tag, not the ```ts fence it is supposed to
 * contain. Keying off the fence would only ever catch a file that already
 * follows the convention: an example written as bare JSDoc lines has no fence
 * at all, so it would pass unnoticed — never type-checked, free to drift as the
 * API around it changes. The complementary per-file count check in
 * {@link embedExamplesInJsDoc} covers the same mistake inside a module that is
 * already mapped.
 *
 * A declaration that genuinely cannot be reached from samples/src — a
 * module-local `@internal` helper, say, since samples import the package
 * through its public entry point — should describe its behavior in prose
 * instead of carrying an `@example`.
 */
const assertAllExamplesAreMapped = async (): Promise<
  Result<undefined, string>
> => {
  const filesResult = await glob(
    path.resolve(workspaceRootPath, 'src/**/*.mts'),
  );

  if (Result.isErr(filesResult)) {
    return Result.err(unknownToString(filesResult.value));
  }

  const mappedSourcePaths = new Set<string>(
    sourceFileMappings.map(({ sourcePath }) =>
      path.resolve(workspaceRootPath, sourcePath),
    ),
  );

  const mut_unmappedFiles: string[] = [];

  for (const filePath of filesResult.value) {
    if (
      filePath.endsWith('.test.mts') ||
      path.basename(filePath) === 'index.mts' ||
      path.basename(filePath) === 'global.mts' ||
      path.basename(filePath) === 'entry-point.mts' ||
      mappedSourcePaths.has(filePath)
    ) {
      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = await fs.readFile(filePath, 'utf8');

    const exampleTagCount = countExampleTags(content);

    if (exampleTagCount > 0 || content.includes(codeBlockStart)) {
      mut_unmappedFiles.push(
        `${path.relative(workspaceRootPath, filePath)} (${exampleTagCount} \`@example\`)`,
      );
    }
  }

  if (Arr.isNonEmpty(mut_unmappedFiles)) {
    return Result.err(
      [
        `❌ Found ${mut_unmappedFiles.length} src file(s) whose \`@example\` blocks are not`,
        'sourced from samples/src (missing from sourceFileMappings in',
        'scripts/cmd/embed-examples-in-jsdoc-map.mts):',
        ...mut_unmappedFiles.toSorted().map((p) => `  - ${p}`),
        'Create sample files under samples/src and add mapping entries for them,',
        'or, for a declaration samples cannot reach, describe the behavior in prose',
        'instead of an `@example`.',
      ].join('\n'),
    );
  }

  return Result.ok(undefined);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedExamplesInJsDoc();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
