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
      '01-simple-state.mts',
      '02-synstate-react-hooks-example.tsx',
      '03-react-18-example.tsx',
      '04-react-example.tsx',
      '05-simple-state-with-additional-api.mts',
      '06-global-counter.tsx',
      '07-todo-reducer.tsx',
      '08-dark-mode.tsx',
      '09-cross-component.tsx',
      '10-search-debounce.tsx',
      '11-event-emitter-throttle.tsx',
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
