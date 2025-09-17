import { pipe } from 'ts-data-forge';
import { formatFiles } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

const codeBlockStart = '```tsx';
const codeBlockEnd = '```';

const ignoreAboveKeyword = '// embed-sample-code-ignore-above';
const ignoreBelowKeyword = '// embed-sample-code-ignore-below';

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
    sampleCodeFiles: [],
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
        const sampleContentSliced = sampleContent
          .slice(
            pipe(sampleContent.indexOf(ignoreAboveKeyword)).map((i) =>
              i === -1 ? 0 : i + ignoreAboveKeyword.length,
            ).value,
            sampleContent.indexOf(ignoreBelowKeyword),
          )
          .replaceAll(/IGNORE_EMBEDDING\(.*\);\n/gu, '')
          .trim();

        const codeBlockStartIndex = mut_rest.indexOf(codeBlockStart);

        if (codeBlockStartIndex === -1) {
          return Result.err(
            `❌ codeBlockStart not found for ${sampleCodeFile}`,
          );
        }

        const codeBlockEndIndex = mut_rest.indexOf(
          codeBlockEnd,
          codeBlockStartIndex + codeBlockStart.length,
        );

        if (codeBlockEndIndex === -1) {
          return Result.err(`❌ codeBlockEnd not found for ${sampleCodeFile}`);
        }

        // Replace the code block content
        const beforeBlock = mut_rest.slice(
          0,
          Math.max(0, codeBlockStartIndex + codeBlockStart.length),
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
    return Result.err(`❌ Failed to embed samples: ${String(error)}`);
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedSamples();
  if (Result.isErr(result)) {
    console.error(result.value);
    process.exit(1);
  }
}
