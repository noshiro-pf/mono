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
      'en.mts',
      'ja.mts',
      'i18n.mts',
      '01-texts.mts',
      '02-component.tsx',
      '03-start-locale.mts',
      '04-format.mts',
      '05-check-translation.mts',
    ],
  },
] as const;

/** Embeds sample code from ./samples/readme directory into README.md */
export const embedExamples = async (): Promise<Result<undefined, unknown>> =>
  embedExamplesInMarkdown({ documents, stripTransformerDirectives: true });

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedExamples();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
