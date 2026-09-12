import * as path from 'node:path';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { embedExamplesInMarkdown } from '../../../../tools/configs/embed-examples-in-markdown.mjs';
import { projectRootPath } from '../project-root-path.mjs';

const documents = [
  {
    mdPath: path.resolve(projectRootPath, 'README.md'),
    samplesDir: path.resolve(projectRootPath, 'samples/readme'),
    sampleCodeFiles: [
      'append-as-const-example.mts',
      'remove-as-const-for-const-type-parameters-example.mts',
      'convert-to-readonly-example.mts',
      'convert-interface-to-type-example.mts',
      'replace-any-with-unknown-example.mts',
      'replace-record-with-unknown-record-example.mts',
      'enable-no-unchecked-indexed-access-example.mts',
      'transformer-ignore-next-line-example.mts',
      'transformer-ignore-file-example.mts',
      'programmatic-usage.mts',
      'apply-transformers-to-src-directory.mts',
      'jsdoc-example.mts',
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
