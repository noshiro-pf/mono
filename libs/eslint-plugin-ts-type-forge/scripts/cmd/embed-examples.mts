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
      '01-recommended-config.mts',
      '02-override-rule-options.mts',
      '03-pick-rules.mts',
      '04-prefer-canonical-length-constrained-tuple.mts',
      '05-prefer-canonical-mutable-record.mts',
      '06-prefer-strict-or-relaxed-utility-type.mts',
      '07-prefer-readonly-or-mutable-record.mts',
      '08-no-side-effect-import.mts',
      '09-rule-options.mts',
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
