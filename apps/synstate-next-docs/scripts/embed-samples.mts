import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, Result } from 'ts-data-forge';
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

/** synstate's samples, relative to {@link samplesDir}. */
const synstateSamples = '../../../synstate/samples/docs-site';

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
      'deriving/01-derive.mts',
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
  // The other libraries' versions are the ones the synstate docs show, run by
  // synstate's own tests.
  [
    'comparison/async-logic.md',
    [
      'async-comparison/00-search-api.mts',
      'async-comparison/01-search.synstate-next.mts',
      ...['rxjs', 'mobx', 'jotai', 'redux', 'solid', 'preact-signals'].map(
        (lib) => `${synstateSamples}/async-comparison/01-search.${lib}.mts`,
      ),
    ],
  ],
  [
    'comparison/operators-on-signals.md',
    [
      'operators-on-signals/00-search-request.mts',
      `${synstateSamples}/operators-on-signals/01-async-step.preact-signals.mts`,
      'operators-on-signals/01-async-step.synstate-next.mts',
      `${synstateSamples}/operators-on-signals/02-count-events.preact-signals.mts`,
      'operators-on-signals/02-count-events.synstate-next.mts',
    ],
  ],
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

/**
 * Embeds the samples into the pages' code fences, once the files the comparison
 * pages share with synstate's samples are found identical.
 */
export const embedSamples = async (): Promise<Result<undefined, unknown>> => {
  const drifted = await Result.fromPromise(driftedCopies());

  if (Result.isErr(drifted)) {
    return drifted;
  }

  if (Arr.isNonEmpty(drifted.value)) {
    return Result.err(
      [
        "Every shared file in these comparison directories must be a copy of synstate's, which the other libraries' listings on the same page import:",
        ...drifted.value.map(
          ({ file, missing }) =>
            `  - ${path.relative(repoRoot, path.resolve(samplesDir, file))} ${missing ? 'has no copy at' : 'differs from'} ${path.relative(repoRoot, path.resolve(samplesDir, synstateSamples, file))}`,
        ),
        'Make both copies the same. A file only synstate-next uses does not belong in these directories.',
      ].join('\n'),
    );
  }

  return embedExamplesInMarkdown({
    documents,
    stripTransformerDirectives: true,
  });
};

/**
 * The directories of the comparison pages, which embed synstate's samples
 * beside synstate-next's. In each, every file but the synstate-next versions
 * (`*.synstate-next.*`) is shared: the search API and its test suite, the
 * search request. The synstate-next version imports its own copy (a relative
 * import may not cross into another package) and every other library's listing
 * imports synstate's, so a page holds one specification only while the copies
 * agree.
 */
const sharedDirs = Arr.uniq(
  pageSamples.flatMap(([, files]) =>
    files
      .filter((file) => file.startsWith(`${synstateSamples}/`))
      .map((file) => path.dirname(file.slice(synstateSamples.length + 1))),
  ),
);

const repoRoot = path.resolve(workspaceRootPath, '../..');

/** The file's text, or `undefined` when there is no such file. */
const readIfPresent = async (filePath: string): Promise<string | undefined> => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (isRecord(error) && error['code'] === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
};

/**
 * The shared files whose synstate-next copy differs from synstate's, or that
 * synstate does not have.
 */
const driftedCopies = async (): Promise<
  readonly Readonly<{ file: string; missing: boolean }>[]
> => {
  const listed = await Promise.all(
    sharedDirs.map(async (dir) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const entries = await fs.readdir(path.resolve(samplesDir, dir), {
        withFileTypes: true,
      });

      return entries
        .filter(
          (entry) => entry.isFile() && !entry.name.includes('.synstate-next.'),
        )
        .map((entry) => `${dir}/${entry.name}`);
    }),
  );

  const drifted = await Promise.all(
    listed.flat().map(async (file) => {
      // The paths are those of files listed in the sample directories.
      const [copy, original] = await Promise.all([
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFile(path.resolve(samplesDir, file), 'utf8'),
        readIfPresent(path.resolve(samplesDir, synstateSamples, file)),
      ]);

      return original === copy
        ? undefined
        : { file, missing: original === undefined };
    }),
  );

  return drifted.filter((entry) => entry !== undefined);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedSamples();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
