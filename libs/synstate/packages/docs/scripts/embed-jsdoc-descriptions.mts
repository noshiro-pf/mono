import { pathExists } from 'ts-repo-utils';
import { workspaceRootPath } from './workspace-root-path.mjs';

const synstateRoot = path.resolve(workspaceRootPath, '../synstate');

const refDir = path.resolve(workspaceRootPath, 'src/content/docs/reference');

// Japanese reference pages maintain manually-written descriptions,
// so src/content/docs/ja/reference is intentionally not processed here.

/** [referencePageSlug, sourceRelativePath, exportedName] */
const jsdocMappings: DeepReadonly<
  [slug: string, srcPath: string, funcName: string][]
> = [
  [
    'attach-index',
    'src/core/predefined/operators/attach-index.mts',
    'withIndex',
  ],
  ['audit', 'src/core/operators/audit.mts', 'audit'],
  ['combine', 'src/core/combine/combine.mts', 'combine'],
  ['counter', 'src/core/create/counter.mts', 'counter'],
  [
    'create-boolean-state',
    'src/utils/create-boolean-state.mts',
    'createBooleanState',
  ],
  [
    'create-event-emitter',
    'src/utils/create-event-emitter.mts',
    'createEventEmitter',
  ],
  ['create-reducer', 'src/utils/create-reducer.mts', 'createReducer'],
  ['create-state', 'src/utils/create-state.mts', 'createState'],
  [
    'create-value-emitter',
    'src/utils/create-event-emitter.mts',
    'createValueEmitter',
  ],
  ['debounce', 'src/core/operators/debounce.mts', 'debounce'],
  ['filter', 'src/core/operators/filter.mts', 'filter'],
  ['from-promise', 'src/core/create/from-promise.mts', 'fromPromise'],
  ['just', 'src/core/create/just.mts', 'just'],
  [
    'from-subscribable',
    'src/core/create/from-subscribable.mts',
    'fromSubscribable',
  ],
  ['get-key', 'src/core/predefined/operators/pluck.mts', 'pluck'],
  ['map', 'src/core/operators/map.mts', 'map'],
  [
    'map-optional',
    'src/core/predefined/operators/map-optional.mts',
    'mapOptional',
  ],
  [
    'map-result-err',
    'src/core/predefined/operators/map-result-err.mts',
    'mapResultErr',
  ],
  [
    'map-result-ok',
    'src/core/predefined/operators/map-result-ok.mts',
    'mapResultOk',
  ],
  ['map-to', 'src/core/predefined/operators/map-to.mts', 'mapTo'],
  ['merge', 'src/core/combine/merge.mts', 'merge'],
  ['merge-map', 'src/core/operators/merge-map.mts', 'mergeMap'],
  ['pairwise', 'src/core/operators/pairwise.mts', 'pairwise'],
  ['scan', 'src/core/operators/scan.mts', 'scan'],
  ['skip', 'src/core/predefined/operators/skip.mts', 'skip'],
  [
    'skip-if-no-change',
    'src/core/operators/skip-if-no-change.mts',
    'skipIfNoChange',
  ],
  ['skip-until', 'src/core/operators/skip-until.mts', 'skipUntil'],
  ['skip-while', 'src/core/operators/skip-while.mts', 'skipWhile'],
  ['source', 'src/core/create/source.mts', 'source'],
  ['switch-map', 'src/core/operators/switch-map.mts', 'switchMap'],
  ['take', 'src/core/predefined/operators/take.mts', 'take'],
  ['take-until', 'src/core/operators/take-until.mts', 'takeUntil'],
  ['take-while', 'src/core/operators/take-while.mts', 'takeWhile'],
  ['throttle', 'src/core/operators/throttle.mts', 'throttle'],
  ['timer', 'src/core/create/timer.mts', 'timer'],
  [
    'unwrap-optional',
    'src/core/predefined/operators/unwrap-optional.mts',
    'unwrapOptional',
  ],
  [
    'unwrap-result-err',
    'src/core/predefined/operators/unwrap-result-err.mts',
    'unwrapResultErr',
  ],
  [
    'unwrap-result-ok',
    'src/core/predefined/operators/unwrap-result-ok.mts',
    'unwrapResultOk',
  ],
  [
    'with-buffered',
    'src/core/operators/with-buffered-from.mts',
    'withBufferedFrom',
  ],
  [
    'with-current-value-from',
    'src/core/operators/with-current-value-from.mts',
    'withCurrentValueFrom',
  ],
  [
    'with-initial-value',
    'src/core/operators/with-initial-value.mts',
    'withInitialValue',
  ],
  ['zip', 'src/core/combine/zip.mts', 'zip'],
] as const;

const jaRefDir = path.resolve(
  workspaceRootPath,
  'src/content/docs/ja/reference',
);

const githubBaseUrl =
  'https://github.com/noshiro-pf/synstate/blob/main/packages/synstate';

const placeholderStart = '{/* jsdoc-description */}';

const placeholderEnd = '{/* /jsdoc-description */}';

/**
 * Extracts the JSDoc description (text before any @-tag) for a given export name.
 */
const extractJsdocDescription = (
  sourceContent: string,
  funcName: string,
): string | undefined => {
  // Match JSDoc block immediately before `export const funcName` or `export function funcName`.
  // Uses `(?:(?!/\*\*)[\s\S])*?` instead of `[\s\S]*?` to prevent matching across
  // multiple JSDoc blocks when the same file contains several exported functions.
  // eslint-disable-next-line security/detect-non-literal-regexp
  const pattern = new RegExp(
    String.raw`/\*\*((?:(?!/\*\*)[\s\S])*?)\*/\s*\n(?:export (?:const|function) ${funcName}\b)`,
    'u',
  );

  const match = pattern.exec(sourceContent);

  if (match?.[1] === undefined) {
    return undefined;
  }

  const jsdocBody = match[1];

  const lines = jsdocBody.split('\n');

  const mut_descLines: string[] = [];

  for (const line of lines) {
    // Strip leading " * " or " *"
    const cleaned = line.replace(/^\s*\*\s?/u, '');

    // Stop at the first @-tag
    if (/^@\w/u.test(cleaned)) {
      break;
    }

    mut_descLines.push(cleaned);
  }

  const description = mut_descLines.join('\n').trim();

  return description.length > 0 ? description : undefined;
};

const replacePlaceholder = (
  markdown: string,
  description: string,
): 'no-placeholder' | Readonly<{ result: string }> => {
  const startIdx = markdown.indexOf(placeholderStart);

  if (startIdx === -1) {
    return 'no-placeholder';
  }

  const endIdx = markdown.indexOf(placeholderEnd, startIdx);

  if (endIdx === -1) {
    return 'no-placeholder';
  }

  return {
    result: [
      markdown.slice(0, startIdx + placeholderStart.length),
      '\n',
      description,
      '\n',
      markdown.slice(endIdx),
    ].join(''),
  };
};

const processRefDir = async (
  targetRefDir: string,
  label: string,
): Promise<void> => {
  for (const [slug, srcPath, funcName] of jsdocMappings) {
    const sourceFilePath = path.resolve(synstateRoot, srcPath);

    const mdxPath = path.resolve(targetRefDir, `${slug}.mdx`);

    const mdxExists = await pathExists(mdxPath);

    const mdPath = mdxExists
      ? mdxPath
      : path.resolve(targetRefDir, `${slug}.md`);

    const mdExists = await pathExists(mdPath);

    if (!mdExists) {
      continue;
    }

    const sourceContent = await fs.readFile(sourceFilePath, 'utf8');

    const description = extractJsdocDescription(sourceContent, funcName);

    if (description === undefined) {
      console.warn(
        `⚠ No JSDoc description found for ${funcName} in ${srcPath}`,
      );

      continue;
    }

    const markdown = await fs.readFile(mdPath, 'utf8');

    const replaced = replacePlaceholder(markdown, description);

    const mdFileName = path.basename(mdPath);

    if (replaced === 'no-placeholder') {
      console.warn(`⚠ [${label}] Placeholder not found in ${mdFileName}`);

      continue;
    }

    if (replaced.result === markdown) {
      console.log(`· [${label}] Already up to date: ${mdFileName}`);

      continue;
    }

    await fs.writeFile(mdPath, replaced.result, 'utf8');

    console.log(
      `✓ [${label}] Embedded JSDoc description for ${funcName} → ${mdFileName}`,
    );
  }
};

const sourceLinkStart = '{/* source-link */}';

const sourceLinkEnd = '{/* /source-link */}';

const replaceSourceLink = (
  markdown: string,
  srcPath: string,
): 'no-placeholder' | Readonly<{ result: string }> => {
  const startIdx = markdown.indexOf(sourceLinkStart);

  if (startIdx === -1) {
    return 'no-placeholder';
  }

  const endIdx = markdown.indexOf(sourceLinkEnd, startIdx);

  if (endIdx === -1) {
    return 'no-placeholder';
  }

  const link = `[View source on GitHub](${githubBaseUrl}/${srcPath})` as const;

  return {
    result: [
      markdown.slice(0, startIdx + sourceLinkStart.length),
      '\n',
      link,
      '\n',
      markdown.slice(endIdx),
    ].join(''),
  };
};

const embedSourceLinks = async (
  targetRefDir: string,
  label: string,
): Promise<void> => {
  for (const [slug, srcPath] of jsdocMappings) {
    const mdxPath = path.resolve(targetRefDir, `${slug}.mdx`);

    const mdxExists = await pathExists(mdxPath);

    const mdPath = mdxExists
      ? mdxPath
      : path.resolve(targetRefDir, `${slug}.md`);

    const mdExists = await pathExists(mdPath);

    if (!mdExists) {
      continue;
    }

    const markdown = await fs.readFile(mdPath, 'utf8');

    const replaced = replaceSourceLink(markdown, srcPath);

    const mdFileName = path.basename(mdPath);

    if (replaced === 'no-placeholder') {
      console.warn(
        `⚠ [${label}] Source link placeholder not found in ${mdFileName}`,
      );

      continue;
    }

    if (replaced.result === markdown) {
      continue;
    }

    await fs.writeFile(mdPath, replaced.result, 'utf8');

    console.log(`✓ [${label}] Embedded source link → ${mdFileName}`);
  }
};

const embedJsdocDescriptions = async (): Promise<void> => {
  // JSDoc descriptions: English only (Japanese pages maintain manual translations)
  await processRefDir(refDir, 'en');

  // Source links: both languages (language-independent)
  await embedSourceLinks(refDir, 'en');

  await embedSourceLinks(jaRefDir, 'ja');
};

const result = await embedJsdocDescriptions().catch((error: unknown) => error);

if (result !== undefined) {
  console.error(result);

  process.exit(1);
}
