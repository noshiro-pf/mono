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
      'setup-explicit-import.mts',
      'setup-ambient-types-option.mts',
      'setup-ambient-triple-slash.mts',
      '01-type-eq-and-extends.mts',
      '02-deep-readonly-and-deep-partial.mts',
      '03-strict-omit.mts',
      '04-non-empty-array-and-list.mts',
      '05-json-value.mts',
      '06-uint-range-and-brands.mts',
      'runtime-type-guards-with-ts-data-forge.mts',
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
