import { pipe, unknownToString } from 'ts-data-forge';
import { Result, formatFiles } from 'ts-repo-utils';
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
    sampleCodeFiles: [
      'quick-start/quick-start.test.mts',
      'default-values-and-data-filling/intro.test.mts',
      'default-values-and-data-filling/convenient-default-values/01.test.mts',
      'default-values-and-data-filling/convenient-default-values/02.test.mts',
      'default-values-and-data-filling/convenient-default-values/03.test.mts',
      'primitive-constraints/string-constraints.mts',
      'primitive-constraints/number-constraints.mts',
      'primitive-constraints/bigint-constraints.mts',
      'why-ts-fortress-over-zod-and-io-ts/migration-from-io-ts/io-ts.test.mts',
      'why-ts-fortress-over-zod-and-io-ts/migration-from-io-ts/ts-fortress.test.mts',
      'core-concepts/type-interface/type.test.mts',
      'core-concepts/type-interface/validate.test.mts',
      'core-concepts/type-interface/assert-is.test.mts',
      'core-concepts/type-interface/cast.test.mts',
      'core-concepts/type-interface/default-value.test.mts',
      'core-concepts/primitive-types/01.test.mts',
      'core-concepts/record-types/01.test.mts',
      'core-concepts/refined-types/01.test.mts',
      'core-concepts/refined-types/02.test.mts',
      'core-concepts/branded-types/01.test.mts',
      'core-concepts/union-and-intersection-types/01.test.mts',
      'core-concepts/enums/01.test.mts',
      'error-handling/01.error-handling.test.mts',
      'error-handling/02.validation-error-structure.test.mts',
    ],
  },
  {
    mdPath: path.resolve(
      projectRootPath,
      'documents/why-ts-fortress-over-zod-and-io-ts.md',
    ),
    samplesDir: path.resolve(
      projectRootPath,
      'samples/why-ts-fortress-over-zod-and-io-ts',
    ),
    sampleCodeFiles: [
      // Type Safety when Building Schemas
      'type-safety-when-building-schemas/01.zod-incorrect.test.mts',
      'type-safety-when-building-schemas/02.zod-correct.test.mts',
      'type-safety-when-building-schemas/03.ts-fortress.test.mts',

      // Deep Readonly Types by Default
      'deep-readonly-types-by-default/01.ts-fortress-user-type.test.mts',
      'deep-readonly-types-by-default/02.zod-user-schema.test.mts',
      'deep-readonly-types-by-default/03.io-ts-nested-readonly.test.mts',
      'deep-readonly-types-by-default/04.ts-fortress-clean-structure.test.mts',
      'deep-readonly-types-by-default/05.zod-prettify-error.test.mts',

      // Runtime-Type Consistency Issues in io-ts
      'runtime-type-consistency-issues-in-io-ts/keyof-type-mismatch/01.io-ts.test.mts',
      'runtime-type-consistency-issues-in-io-ts/keyof-type-mismatch/02.ts-fortress.test.mts',
      'runtime-type-consistency-issues-in-io-ts/union-undefined-decode-issues/01.io-ts.test.mts',
      'runtime-type-consistency-issues-in-io-ts/union-undefined-decode-issues/02.ts-fortress.test.mts',
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
