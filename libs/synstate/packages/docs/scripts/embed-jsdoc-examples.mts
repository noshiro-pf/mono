import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { type DeepReadonly } from 'ts-type-forge';
import { extractSampleCode } from './embed-examples-utils.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

const synstateRoot = path.resolve(workspaceRootPath, '../synstate');

const synstateSamplesDir = path.resolve(synstateRoot, 'samples/src');

const codeBlockStart = ' * ```ts\n';

const codeBlockEnd = ' * ```';

/**
 * [sourceRelativePath, exportedFunctionName, sampleFileName]
 *
 * Sorted alphabetically by slug for readability;
 * slug itself is implicit (not used by this script).
 */
const jsdocExampleMappings: DeepReadonly<
  [srcPath: string, funcName: string, sampleFile: string][]
> = [
  [
    'src/core/predefined/operators/attach-index.mts',
    'withIndex',
    'attach-index-example.mts',
  ],
  ['src/core/operators/audit.mts', 'audit', 'audit-example.mts'],
  ['src/core/combine/combine.mts', 'combine', 'combine-example.mts'],
  ['src/core/create/counter.mts', 'counter', 'counter-example.mts'],
  [
    'src/utils/create-state.mts',
    'createBooleanState',
    'create-boolean-state-example.tsx',
  ],
  [
    'src/utils/create-event-emitter.mts',
    'createEventEmitter',
    'create-void-event-emitter-example.mts',
  ],
  [
    'src/utils/create-reducer.mts',
    'createReducer',
    'create-reducer-example.mts',
  ],
  ['src/utils/create-state.mts', 'createState', 'create-state-example.mts'],
  [
    'src/utils/create-event-emitter.mts',
    'createValueEmitter',
    'create-event-emitter-example.mts',
  ],
  ['src/core/operators/debounce.mts', 'debounce', 'debounce-example.mts'],
  ['src/core/operators/filter.mts', 'filter', 'filter-example.mts'],
  [
    'src/core/create/from-promise.mts',
    'fromPromise',
    'from-promise-example.mts',
  ],
  [
    'src/core/create/from-subscribable.mts',
    'fromSubscribable',
    'from-subscribable-example.mts',
  ],
  ['src/core/predefined/operators/pluck.mts', 'pluck', 'get-key-example.mts'],
  ['src/core/operators/map.mts', 'map', 'map-example.mts'],
  [
    'src/core/predefined/operators/map-optional.mts',
    'mapOptional',
    'map-optional-example.mts',
  ],
  [
    'src/core/predefined/operators/map-result-err.mts',
    'mapResultErr',
    'map-result-err-example.mts',
  ],
  [
    'src/core/predefined/operators/map-result-ok.mts',
    'mapResultOk',
    'map-result-ok-example.mts',
  ],
  ['src/core/predefined/operators/map-to.mts', 'mapTo', 'map-to-example.mts'],
  ['src/core/combine/merge.mts', 'merge', 'merge-example.mts'],
  ['src/core/operators/merge-map.mts', 'mergeMap', 'merge-map-example.mts'],
  ['src/core/operators/pairwise.mts', 'pairwise', 'pairwise-example.mts'],
  ['src/core/operators/scan.mts', 'scan', 'scan-example.mts'],
  ['src/core/predefined/operators/skip.mts', 'skip', 'skip-example.mts'],
  [
    'src/core/operators/skip-if-no-change.mts',
    'skipIfNoChange',
    'skip-if-no-change-example.mts',
  ],
  ['src/core/operators/skip-until.mts', 'skipUntil', 'skip-until-example.mts'],
  ['src/core/operators/skip-while.mts', 'skipWhile', 'skip-while-example.mts'],
  ['src/core/create/source.mts', 'source', 'source-example.mts'],
  ['src/core/operators/switch-map.mts', 'switchMap', 'switch-map-example.mts'],
  ['src/core/predefined/operators/take.mts', 'take', 'take-example.mts'],
  ['src/core/operators/take-until.mts', 'takeUntil', 'take-until-example.mts'],
  ['src/core/operators/take-while.mts', 'takeWhile', 'take-while-example.mts'],
  ['src/core/operators/throttle.mts', 'throttle', 'throttle-example.mts'],
  ['src/core/create/timer.mts', 'timer', 'timer-example.mts'],
  [
    'src/core/predefined/operators/unwrap-optional.mts',
    'unwrapOptional',
    'unwrap-optional-example.mts',
  ],
  [
    'src/core/predefined/operators/unwrap-result-err.mts',
    'unwrapResultErr',
    'unwrap-result-err-example.mts',
  ],
  [
    'src/core/predefined/operators/unwrap-result-ok.mts',
    'unwrapResultOk',
    'unwrap-result-ok-example.mts',
  ],
  [
    'src/core/operators/with-buffered-from.mts',
    'withBufferedFrom',
    'with-buffered-from-example.mts',
  ],
  [
    'src/core/operators/with-current-value-from.mts',
    'withCurrentValueFrom',
    'with-current-value-from-example.mts',
  ],
  [
    'src/core/operators/with-initial-value.mts',
    'withInitialValue',
    'with-initial-value-example.mts',
  ],
  ['src/core/combine/zip.mts', 'zip', 'zip-example.mts'],
] as const;

/**
 * Formats extracted sample code for embedding inside a JSDoc `@example` code block.
 * Each line is prefixed with ` * ` (or ` *` for empty lines).
 */
const formatForJsdoc = (code: string): string =>
  code
    .split('\n')
    .map((line) => (line.length > 0 ? ` * ${line}` : ' *'))
    .join('\n');

/**
 * Replaces the content inside a JSDoc `@example` code block for the given function.
 * Returns the updated source content, or `undefined` if the block was not found.
 */
const replaceJsdocExample = (
  sourceContent: string,
  funcName: string,
  formattedCode: string,
): string | undefined => {
  // Match the JSDoc block immediately preceding `export const funcName` or `export function funcName`.
  // Uses `(?:(?!/\*\*)[\s\S])*?` instead of `[\s\S]*?` to prevent matching across
  // multiple JSDoc blocks when the same file contains several exported functions.
  // eslint-disable-next-line security/detect-non-literal-regexp
  const funcPattern = new RegExp(
    String.raw`/\*\*((?:(?!/\*\*)[\s\S])*?)\*/\s*\nexport (?:const|function) ${funcName}\b`,
    'u',
  );

  const funcMatch = funcPattern.exec(sourceContent);

  if (funcMatch === null) {
    return undefined;
  }

  const jsdocBlock = funcMatch[0];

  const jsdocStartPos = funcMatch.index;

  // Find ` * ```ts\n` ... ` * ``` ` within the matched JSDoc block
  const startIdx = jsdocBlock.indexOf(codeBlockStart);

  if (startIdx === -1) {
    return undefined;
  }

  const contentStart = startIdx + codeBlockStart.length;

  const endIdx = jsdocBlock.indexOf(codeBlockEnd, contentStart);

  if (endIdx === -1) {
    return undefined;
  }

  const newJsdocBlock = `${
    jsdocBlock.slice(0, contentStart) + formattedCode
  }\n${jsdocBlock.slice(endIdx)}` as const;

  return (
    sourceContent.slice(0, jsdocStartPos) +
    newJsdocBlock +
    sourceContent.slice(jsdocStartPos + jsdocBlock.length)
  );
};

const embedJsdocExamples = async (): Promise<void> => {
  for (const [srcPath, funcName, sampleFile] of jsdocExampleMappings) {
    const sourceFilePath = path.resolve(synstateRoot, srcPath);

    const samplePath = path.resolve(synstateSamplesDir, sampleFile);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const sampleContent = await fs.readFile(samplePath, 'utf8');

    const extracted = extractSampleCode(sampleContent);

    const formatted = formatForJsdoc(extracted);

    // Re-read the source file each time (handles multiple functions in the same file)
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const sourceContent = await fs.readFile(sourceFilePath, 'utf8');

    const updated = replaceJsdocExample(sourceContent, funcName, formatted);

    if (updated === undefined) {
      console.warn(
        `⚠ No @example code block found for ${funcName} in ${srcPath}`,
      );

      continue;
    }

    if (updated === sourceContent) {
      console.info(`· Already up to date: ${funcName} in ${srcPath}`);

      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(sourceFilePath, updated, 'utf8');

    console.info(`✓ Embedded example for ${funcName} → ${srcPath}`);
  }
};

const result = await embedJsdocExamples().catch((error: unknown) => error);

if (result !== undefined) {
  console.error(result);

  process.exit(1);
}
