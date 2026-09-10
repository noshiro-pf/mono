import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { embedExamplesInMarkdown } from '../../../../tools/configs/embed-examples-in-markdown.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Each entry maps to a code block (```tsx / ```ts / ```js) in the target
 * markdown, in document order. The list length must equal the number of such
 * blocks in the markdown.
 */
const documents = [
  {
    mdPath: path.resolve(projectRootPath, 'README.md'),
    samplesDir: path.resolve(projectRootPath, 'samples/readme'),
    sampleCodeFiles: [
      '001-command-execution.mts',
      '002-command-execution-type.mts',
      '003-is-directly-executed.mts',
      '004-path-exists.mts',
      '005-assert-path-exists.mts',
      '006-check-ext.mts',
      '007-assert-ext.mts',
      '008-assert-ext-type.mts',
      '009-create-result-assert.mts',
      '010-make-empty-dir.mts',
      '011-repo-is-dirty.mts',
      '012-assert-repo-is-clean.mts',
      '013-get-diff-from-type.mts',
      '014-check-should-run.mts',
      '015-format-files-glob.mts',
      '016-format-uncommitted-files.mts',
      '017-format-uncommitted-files-type.mts',
      '018-format-diff-from.mts',
      '019-format-diff-from-type.mts',
      '020-gen-index.mts',
      '021-gen-index-type.mts',
      '022-run-cmd-in-stages-across-workspaces.mts',
      '023-run-cmd-in-parallel-across-workspaces.mts',
      '024-get-workspace-packages.mts',
      '025-get-workspace-packages-type.mts',
      '026-execute-parallel.mts',
      '027-execute-stages.mts',
      '028-pre-commit-hook.mts',
      '029-build-pipeline.mts',
      '030-project-validation.mts',
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
