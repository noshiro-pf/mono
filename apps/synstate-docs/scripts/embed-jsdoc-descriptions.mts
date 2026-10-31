import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { pathExists } from 'ts-repo-utils';
import type { DeepReadonly } from 'ts-type-forge';
import { workspaceRootPath } from './workspace-root-path.mjs';

const synstateRoot = path.resolve(workspaceRootPath, '../../libs/synstate');

const refDir = path.resolve(workspaceRootPath, 'src/content/docs/reference');

// Japanese reference pages maintain manually-written descriptions, so the
// JSDoc text is not embedded into src/content/docs/ja/reference; their
// frontmatter `description` comes from that hand-written Japanese block.

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
  ['derive', 'src/core/combine/derive.mts', 'derive'],
  ['filter', 'src/core/operators/filter.mts', 'filter'],
  [
    'from-abortable-promise',
    'src/core/create/from-abortable-promise.mts',
    'fromAbortablePromise',
  ],
  ['from-promise', 'src/core/create/from-promise.mts', 'fromPromise'],
  ['just', 'src/core/create/just.mts', 'just'],
  ['empty', 'src/core/create/empty.mts', 'empty'],
  [
    'from-subscribable',
    'src/core/create/from-subscribable.mts',
    'fromSubscribable',
  ],
  ['get-key', 'src/core/predefined/operators/pluck.mts', 'pluck'],
  [
    'keep-equal-parts',
    'src/core/operators/keep-equal-parts.mts',
    'keepEqualParts',
  ],
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
  ['take', 'src/core/operators/take.mts', 'take'],
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
  'https://github.com/noshiro-pf/mono/blob/main/libs/synstate';

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

/**
 * Where the text between a start marker and the end marker after it lies:
 * `from` is just after the start marker, `to` is the end marker's index.
 */
const findMarkedRange = (
  markdown: string,
  start: string,
  end: string,
): Readonly<{ from: number; to: number }> | undefined => {
  const startIdx = markdown.indexOf(start);

  if (startIdx === -1) {
    return undefined;
  }

  const endIdx = markdown.indexOf(end, startIdx);

  return endIdx === -1
    ? undefined
    : { from: startIdx + start.length, to: endIdx };
};

const replaceMarkedRange = (
  markdown: string,
  start: string,
  end: string,
  content: string,
): 'no-placeholder' | Readonly<{ result: string }> => {
  const range = findMarkedRange(markdown, start, end);

  if (range === undefined) {
    return 'no-placeholder';
  }

  return {
    result: [
      markdown.slice(0, range.from),
      '\n',
      content,
      '\n',
      markdown.slice(range.to),
    ].join(''),
  };
};

const replacePlaceholder = (
  markdown: string,
  description: string,
): 'no-placeholder' | Readonly<{ result: string }> =>
  replaceMarkedRange(markdown, placeholderStart, placeholderEnd, description);

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

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const sourceContent = await fs.readFile(sourceFilePath, 'utf8');

    const description = extractJsdocDescription(sourceContent, funcName);

    if (description === undefined) {
      console.warn(
        `⚠ No JSDoc description found for ${funcName} in ${srcPath}`,
      );

      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const markdown = await fs.readFile(mdPath, 'utf8');

    const replaced = replacePlaceholder(markdown, description);

    const mdFileName = path.basename(mdPath);

    if (replaced === 'no-placeholder') {
      console.warn(`⚠ [${label}] Placeholder not found in ${mdFileName}`);

      continue;
    }

    if (replaced.result === markdown) {
      console.info(`· [${label}] Already up to date: ${mdFileName}`);

      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(mdPath, replaced.result, 'utf8');

    console.info(
      `✓ [${label}] Embedded JSDoc description for ${funcName} → ${mdFileName}`,
    );
  }
};

const sourceLinkStart = '{/* source-link */}';

const sourceLinkEnd = '{/* /source-link */}';

const replaceSourceLink = (
  markdown: string,
  srcPath: string,
): 'no-placeholder' | Readonly<{ result: string }> =>
  replaceMarkedRange(
    markdown,
    sourceLinkStart,
    sourceLinkEnd,
    `[View source on GitHub](${githubBaseUrl}/${srcPath})`,
  );

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

    // eslint-disable-next-line security/detect-non-literal-fs-filename
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

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(mdPath, replaced.result, 'utf8');

    console.info(`✓ [${label}] Embedded source link → ${mdFileName}`);
  }
};

const frontmatterPattern = /^---\n([\s\S]*?)\n---\n/u;

const hasFrontmatterDescription = (markdown: string): boolean => {
  const frontmatter = frontmatterPattern.exec(markdown)?.[1];

  return frontmatter !== undefined && /^description:/mu.test(frontmatter);
};

/**
 * A quoted YAML string, so that no sentence can read as YAML syntax or a
 * non-string. Quoted as Prettier quotes it (single quotes unless the value
 * has one and no double quote), so that formatting does not undo it.
 */
const toYamlString = (value: string): string =>
  value.includes("'") && !value.includes('"')
    ? (`"${value.replaceAll('\\', String.raw`\\`)}"` as const)
    : (`'${value.replaceAll("'", "''")}'` as const);

/** The index after the entry at `idx` and the indented lines continuing it. */
const entryEnd = (lines: readonly string[], idx: number): number => {
  const nextOffset = lines.slice(idx + 1).findIndex((l) => !/^\s/u.test(l));

  return nextOffset === -1 ? lines.length : idx + 1 + nextOffset;
};

/**
 * Sets `description:` in the page's frontmatter, replacing the entry that is
 * there or adding one after `title:`.
 */
const setFrontmatterDescription = (
  markdown: string,
  description: string,
  filePath: string,
): string => {
  const match = frontmatterPattern.exec(markdown);

  if (match?.[1] === undefined) {
    throw new Error(`No frontmatter in ${filePath}.`);
  }

  const entry = `description: ${toYamlString(description)}` as const;

  const lines = match[1].split('\n');

  const descriptionIdx = lines.findIndex((l) => l.startsWith('description:'));

  const titleIdx = lines.findIndex((l) => l.startsWith('title:'));

  const insertAt = titleIdx === -1 ? lines.length : entryEnd(lines, titleIdx);

  const [replaceFrom, replaceTo] =
    descriptionIdx === -1
      ? ([insertAt, insertAt] as const)
      : ([descriptionIdx, entryEnd(lines, descriptionIdx)] as const);

  return [
    '---',
    ...lines.slice(0, replaceFrom),
    entry,
    ...lines.slice(replaceTo),
    '---',
    markdown.slice(match[0].length),
  ].join('\n');
};

const extractPlaceholderContent = (markdown: string): string | undefined => {
  const range = findMarkedRange(markdown, placeholderStart, placeholderEnd);

  if (range === undefined) {
    return undefined;
  }

  const content = markdown.slice(range.from, range.to).trim();

  return content.length > 0 ? content : undefined;
};

/** Outside ASCII, as Japanese text is. */
const isWide = (char: string | undefined): boolean =>
  (char?.codePointAt(0) ?? 0) > 0x7f;

/** Whether the text ends in an abbreviation, whose period ends no sentence. */
const endsWithAbbreviation = (text: string): boolean =>
  /(?:^|[\s(])(?:e\.g|i\.e|vs)\.$/iu.test(text);

/**
 * The first sentence of a description's first paragraph: up to the first `。`
 * in Japanese, and in English up to the first `.`, `!` or `?` followed by
 * whitespace (so `Object.is` and `e.g.` do not end it). The whole paragraph
 * when it has no such end.
 */
const firstSentence = (text: string, label: 'en' | 'ja'): string => {
  const paragraph = (text.split(/\n\s*\n/u, 1)[0] ?? '')
    .split('\n')
    .map((line) => line.trim())
    .reduce(
      (joined, line) =>
        joined === ''
          ? line
          : // A line break inside Japanese text is not a space.
            label === 'ja' && isWide(joined.at(-1)) && isWide(line.at(0))
            ? `${joined}${line}`
            : `${joined} ${line}`,
      '',
    );

  if (label === 'ja') {
    const end = paragraph.indexOf('。');

    return end === -1 ? paragraph : paragraph.slice(0, end + 1);
  }

  for (const m of paragraph.matchAll(/[.!?](?=\s|$)/gu)) {
    const sentence = paragraph.slice(0, m.index + 1);

    // An odd number of backticks before it: the period is in inline code.
    const insideCode = sentence.split('`').length % 2 === 0;

    if (!insideCode && !endsWithAbbreviation(sentence)) {
      return sentence;
    }
  }

  return paragraph;
};

/** Text with no Markdown emphasis or HTML/JSX tag markup. */
const stripProseMarkup = (text: string): string =>
  text
    .replaceAll(/<\/?[A-Za-z][^<>]*>/gu, '')
    .replaceAll(/\*\*([^*]+)\*\*/gu, '$1')
    .replaceAll(/\*([^*\s][^*]*)\*/gu, '$1');

/**
 * Plain text for `<meta name="description">`: no Markdown or JSDoc markup.
 * `{@link Target label}` and `{@link Target | label}` keep the label, and
 * inline code keeps its text as written.
 */
const toMetaDescription = (sentence: string): string =>
  sentence
    .replaceAll(/\{@link [^}]*\}/gu, (tag: string) => {
      const [target = '', ...labelWords] = tag
        .slice('{@link '.length, -1)
        .split(/[\s|]+/u)
        .filter((word) => word !== '');

      return Arr.isNonEmpty(labelWords) ? labelWords.join(' ') : target;
    })
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/gu, '$1')
    // Odd segments are inside backticks.
    .split('`')
    .map((segment, i) => (i % 2 === 1 ? segment : stripProseMarkup(segment)))
    .join('')
    .trim();

/**
 * Writes the first sentence of each page's `jsdoc-description` block into its
 * frontmatter `description`, so that search results and link cards tell the
 * reference pages apart. A page with no such block keeps the description it
 * has. Returns the pages left without one.
 */
const embedFrontmatterDescriptions = async (
  targetRefDir: string,
  label: 'en' | 'ja',
): Promise<readonly string[]> => {
  const mut_missing: string[] = [];

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileNames = await fs.readdir(targetRefDir);

  for (const fileName of fileNames.toSorted()) {
    if (!fileName.endsWith('.md') && !fileName.endsWith('.mdx')) {
      continue;
    }

    const filePath = path.resolve(targetRefDir, fileName);

    const relativePath = path.relative(workspaceRootPath, filePath);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const markdown = await fs.readFile(filePath, 'utf8');

    const block = extractPlaceholderContent(markdown);

    const description =
      block === undefined
        ? undefined
        : toMetaDescription(firstSentence(block, label));

    if (description === '') {
      // The block has no text a description can be made of.
      mut_missing.push(relativePath);

      continue;
    }

    const updated =
      description === undefined
        ? markdown
        : setFrontmatterDescription(markdown, description, relativePath);

    if (!hasFrontmatterDescription(updated)) {
      mut_missing.push(relativePath);

      continue;
    }

    if (updated === markdown) {
      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(filePath, updated, 'utf8');

    console.info(`✓ [${label}] Embedded frontmatter description → ${fileName}`);
  }

  return mut_missing;
};

const embedJsdocDescriptions = async (): Promise<void> => {
  // JSDoc descriptions: English only (Japanese pages maintain manual translations)
  await processRefDir(refDir, 'en');

  // Source links: both languages (language-independent)
  await embedSourceLinks(refDir, 'en');

  await embedSourceLinks(jaRefDir, 'ja');

  // Frontmatter descriptions: both languages, each from the page's own text
  const missing = [
    ...(await embedFrontmatterDescriptions(refDir, 'en')),
    ...(await embedFrontmatterDescriptions(jaRefDir, 'ja')),
  ] as const;

  if (Arr.isNonEmpty(missing)) {
    throw new Error(
      [
        'These reference pages have no description: give each a',
        `${placeholderStart} … ${placeholderEnd} block (its first sentence`,
        'becomes the description), or write `description:` in its frontmatter.',
        ...missing.map((file) => `  - ${file}`),
      ].join('\n'),
    );
  }
};

const result = await embedJsdocDescriptions().catch((error: unknown) => error);

if (result !== undefined) {
  console.error(result);

  process.exit(1);
}
