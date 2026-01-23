import { unknownToString } from 'ts-data-forge';
import { formatFiles } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
import { extractSampleCode } from './embed-samples-utils.mjs';

const codeBlockPatterns = ['```tsx', '```ts', '```js'] as const;

const codeBlockEnd = '```';

const documents: DeepReadonly<
  {
    mdPath: string;
    samplesDir: string;
    sampleCodeFiles: string[];
  }[]
> = [
  {
    mdPath: path.resolve(projectRootPath, 'README.md'),
    samplesDir: path.resolve(projectRootPath, 'samples/readme'),
    sampleCodeFiles: [
      'append-as-const-example.mts',
      'convert-to-readonly-example.mts',
      'convert-interface-to-type-example.mts',
      'replace-any-with-unknown-example.mts',
      'replace-record-with-unknown-record-example.mts',
      'transformer-ignore-next-line-example.mts',
      'transformer-ignore-file-example.mts',
      'programmatic-usage.mts',
      'apply-transformers-to-src-directory.mts',
    ],
  },
] as const;

/** Embeds sample code from ./samples/readme directory into README.md */
export const embedSamples = async (): Promise<Result<undefined, unknown>> => {
  try {
    for (const { mdPath, sampleCodeFiles, samplesDir } of documents) {
      const markdownContent = await fs.readFile(mdPath, 'utf8');

      const mut_results: string[] = [];

      let mut_rest: string = markdownContent;

      for (const sampleCodeFile of sampleCodeFiles) {
        const samplePath = path.resolve(samplesDir, sampleCodeFile);

        const sampleContent = await fs.readFile(samplePath, 'utf8');

        const sampleContentSliced = extractSampleCode(sampleContent);

        // Find the next code block that matches one of our patterns
        let mut_codeBlockStartIndex = -1;

        let mut_codeBlockStart = '';

        for (const pattern of codeBlockPatterns) {
          const index = mut_rest.indexOf(pattern);

          if (
            index !== -1 &&
            (mut_codeBlockStartIndex === -1 || index < mut_codeBlockStartIndex)
          ) {
            mut_codeBlockStartIndex = index;

            mut_codeBlockStart = pattern;
          }
        }

        if (mut_codeBlockStartIndex === -1) {
          return Result.err(
            `❌ codeBlockStart not found for ${sampleCodeFile}`,
          );
        }

        const codeBlockEndIndex = mut_rest.indexOf(
          codeBlockEnd,
          mut_codeBlockStartIndex + mut_codeBlockStart.length,
        );

        if (codeBlockEndIndex === -1) {
          return Result.err(`❌ codeBlockEnd not found for ${sampleCodeFile}`);
        }

        // Replace the code block content
        const beforeBlock = mut_rest.slice(
          0,
          Math.max(0, mut_codeBlockStartIndex + mut_codeBlockStart.length),
        );

        const afterBlock = mut_rest.slice(Math.max(0, codeBlockEndIndex));

        mut_results.push(beforeBlock, sampleContentSliced);

        mut_rest = afterBlock;

        console.log(`✓ Updated code block for ${sampleCodeFile}`);
      }

      mut_results.push(mut_rest);

      // Write updated README
      await fs.writeFile(mdPath, mut_results.join('\n'), 'utf8');

      await formatFiles([mdPath]);
    }

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(`❌ Failed to embed samples: ${unknownToString(error)}`);
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedSamples();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
