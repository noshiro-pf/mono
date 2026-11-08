import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { embedExamplesInMarkdown } from '../../../tools/configs/embed-examples-in-markdown.mjs';
import { referencePages } from './reference-pages.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * The samples are synstate-next's own: tests in the package, run by its
 * `check:test` and checked by its `check:types`, so that every code block on
 * the site is code that runs as the page says.
 */
const samplesDir = path.resolve(
  workspaceRootPath,
  '../../libs/synstate-next/samples/docs-site',
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
  [
    'getting-started/introduction.md',
    ['introduction/01-quick-example.mts', 'introduction/02-pipe.mts'],
  ],
  ['guides/why-synstate-next.md', ['why/01-glitch-free.mts']],
  [
    'guides/declarative-state.md',
    [
      'declarative/01-use-memo-analogy.mts',
      'declarative/02-search-pipeline.mts',
      'declarative/03-data-table.mts',
    ],
  ],
  [
    'guides/state-and-writes.md',
    [
      'state/01-create-state.mts',
      'state/02-equals-keep-equal-parts.mts',
      'state/03-writes-from-effects.mts',
      'state/04-batch.mts',
      'state/05-create-reducer.mts',
      'state/06-create-boolean-state.mts',
      'state/07-emitters.mts',
    ],
  ],
  [
    'guides/deriving-values.md',
    [
      'deriving/01-derive-combine.mts',
      'deriving/02-merge-zip.mts',
      'deriving/03-cut-off.mts',
      'deriving/04-with-current-value-from.mts',
    ],
  ],
  [
    'guides/async-operators.md',
    [
      'async/01-time-operators.mts',
      'async/02-switch-map.mts',
      'async/03-merge-map.mts',
      'async/04-timer-counter.mts',
      'async/05-from-subscribable.mts',
    ],
  ],
  [
    'guides/owners-and-lifetime.md',
    [
      'owners/01-owner.mts',
      'owners/02-nested-owners.mts',
      'owners/03-untracked.mts',
    ],
  ],
  [
    'guides/custom-operators-and-sources.md',
    [
      'custom/01-sync-operator.mts',
      'custom/02-several-parents.mts',
      'custom/03-async-operator.mts',
      'custom/04-source.mts',
    ],
  ],
  ['guides/using-with-a-ui.md', ['ui/01-external-store.mts']],
  [
    'examples/patterns.md',
    [
      'examples/01-search-results.mts',
      'examples/02-throttled-refresh.mts',
      'examples/03-todo-list.mts',
    ],
  ],
  [
    'internals/how-an-update-propagates.md',
    ['internals/01-update-order.mts', 'internals/02-deferred-write.mts'],
  ],
  [
    'internals/why-no-completion.md',
    ['internals/03-done-without-completion.mts'],
  ],
  ['internals/tracing-an-update.md', ['internals/04-filter-diamond.mts']],
  // Each reference page shows one sample, named after it.
  ...referencePages.map(
    ({ group, slug }) =>
      [`reference/${group}/${slug}.mdx`, [`reference/${slug}.mts`]] as const,
  ),
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

/** Embeds the samples into the pages' code fences. */
export const embedSamples = async (): Promise<Result<undefined, unknown>> =>
  embedExamplesInMarkdown({ documents, stripTransformerDirectives: true });

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedSamples();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
