import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { embedExamplesInMarkdown } from '../../../../tools/configs/embed-examples-in-markdown.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const documents = [
  {
    mdPath: path.resolve(workspaceRootPath, 'README.md'),
    samplesDir: path.resolve(workspaceRootPath, 'samples/readme'),
    sampleCodeFiles: [
      '01-use-state.tsx',
      '02-use-bool-state.tsx',
      '03-use-state-signature.mts',
      '04-update-state.mts',
      '05-reset-state.mts',
      '06-use-bool-state-signature.mts',
      '07-set-state.mts',
      '08-set-true.mts',
      '09-set-false.mts',
      '10-reset-state.mts',
      '11-toggle-state.mts',
      '12-update-state.mts',
      '13-function-state.mts',
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
