import * as path from 'node:path';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { embedExamplesInMarkdown } from '../../../../tools/configs/embed-examples-in-markdown.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const documents = [
  {
    mdPath: path.resolve(workspaceRootPath, 'README.md'),
    samplesDir: path.resolve(workspaceRootPath, 'samples/readme'),
    sampleCodeFiles: [
      'expect-type.mts',
      'functional-programming.mts',
      'number-utilities.mts',
      'branded-number-types.mts',
      'array-utilities.mts',
      'immutable-collections.mts',
      'type-guards.mts',
      'iteration-range.mts',
      'mutability-utilities.tsx',
      'mutability-utilities2.mts',
    ],
  },
] as const;

/** Embeds sample code from ./samples/readme directory into README.md */
export const embedExamples = async (): Promise<Result<undefined, unknown>> =>
  embedExamplesInMarkdown({ documents });

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedExamples();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
