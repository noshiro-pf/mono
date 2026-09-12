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
      'quick-start.mts',
      'define-config-helper.mts',
      'define-config-helper-2.mts',
      'define-known-rules-helper.mts',
      'with-default-options.mts',
      'config-in-typescript.mts',
      'example-typescript-and-react-project.mts',
      'example-node-js-typescript-project.mts',
      'example-react-testing-library.mts',
      'custom-plugins.mts',
      'override-specific-rules.mts',
      'restricted-syntax-defs.mts',
      'rules-option-type-config.mts',
      'target-specific-files.mts',
      'common-issues-tsconfig-path.mts',
      'common-issues-package-dirs.mts',
      'import-x-no-unused-modules-eslintrc.cjs',
      'import-x-no-unused-modules-flat-config.mts',
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
