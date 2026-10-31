import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { embedExamplesInMarkdown } from '../../../tools/configs/embed-examples-in-markdown.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

const samplesDir = path.resolve(workspaceRootPath, 'samples');

/** The README's samples, shown as they are rather than copied. */
const readmeSample = (file: string): string =>
  path.relative(
    samplesDir,
    path.resolve(
      workspaceRootPath,
      '../../libs/synstate-dom/samples/readme',
      file,
    ),
  );

/**
 * Each page and the samples that fill its code fences, in order. The English
 * page and its Japanese translation show the same code, so both are listed from
 * one entry.
 */
const pageSamples: readonly (readonly [
  page: string,
  sampleFiles: readonly string[],
])[] = [
  ['getting-started/installation.md', [readmeSample('01-counter.tsx')]],
  [
    'guides/bindable.md',
    [
      'bindable/01-constant.tsx',
      'bindable/02-view.tsx',
      'bindable/03-helpers.tsx',
    ],
  ],
  [
    'guides/elements.md',
    [
      'elements/01-attributes.tsx',
      'elements/02-class-style.tsx',
      'elements/03-events-ref.tsx',
      'elements/04-svg.tsx',
    ],
  ],
  [
    'guides/control-flow.md',
    [
      'control-flow/01-if.tsx',
      'control-flow/02-match-optional.tsx',
      'control-flow/03-match-result.tsx',
      'control-flow/04-for.tsx',
      'control-flow/05-portal.tsx',
    ],
  ],
  [
    'guides/components.md',
    [
      readmeSample('03-bindable-props.tsx'),
      'components/02-plain-javascript.tsx',
      'components/03-read-once.tsx',
      'components/04-children.tsx',
    ],
  ],
  [
    'guides/lifecycle.md',
    [
      'lifecycle/01-local-derivation.tsx',
      'lifecycle/02-branch-local.tsx',
      'lifecycle/03-scope-effects.tsx',
    ],
  ],
  ['examples/todo-list.md', [readmeSample('02-todo-list.tsx')]],
] as const;

const docsDir = path.resolve(workspaceRootPath, 'src/content/docs');

const documents = pageSamples.flatMap(([page, sampleCodeFiles]) =>
  [docsDir, path.resolve(docsDir, 'ja')].map(
    (dir) =>
      ({
        mdPath: path.resolve(dir, page),
        samplesDir,
        sampleCodeFiles,
      }) as const,
  ),
);

/** Embeds the code in `samples/` into the pages' code fences. */
export const embedSamples = async (): Promise<Result<undefined, unknown>> =>
  embedExamplesInMarkdown({ documents, stripTransformerDirectives: true });

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedSamples();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
