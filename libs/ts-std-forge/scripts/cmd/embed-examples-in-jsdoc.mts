import { isDirectlyExecuted, Result } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { embedExamplesInJsDoc as embedExamplesInJsDocShared } from '../../../../tools/configs/embed-examples-in-jsdoc.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { sourceFileMappings } from './embed-examples-in-jsdoc-map.mjs';

/**
 * `@example` blocks that are not backed by a sample file under `samples/src`
 * yet — the backlog of https://github.com/noshiro-pf/mono/issues/1880. The
 * coverage check fails on an entry that is no longer needed, so the list can
 * only shrink.
 */
const exemptSourcePaths: readonly string[] = [
  'src/functional/async-result/impl/async-result-flat-map.mts',
  'src/functional/async-result/impl/async-result-from-promise.mts',
  'src/functional/async-result/impl/async-result-from-throwable.mts',
  'src/functional/async-result/impl/async-result-map-err.mts',
  'src/functional/async-result/impl/async-result-map.mts',
  'src/functional/async-result/impl/async-result-unwrap-or.mts',
  'src/panic/panic.mts',
  'src/regex/impl/create.mts',
  'src/safe-array/impl/create.mts',
  'src/safe-array/impl/is-array.mts',
  'src/safe-array/impl/is-empty.mts',
  'src/safe-array/impl/is-non-empty.mts',
  'src/safe-date/impl/to-iso-string.mts',
  'src/safe-number/impl/parse-integer.mts',
  'src/safe-number/impl/parse.mts',
  'src/safe-number/impl/to-exponential.mts',
  'src/safe-number/impl/to-fixed.mts',
  'src/safe-number/impl/to-precision.mts',
  'src/safe-number/impl/to-string-with-radix.mts',
  'src/safe-string/impl/from-code-point.mts',
  'src/safe-string/impl/from-primitive.mts',
  'src/safe-string/impl/normalize.mts',
  'src/safe-string/impl/repeat.mts',
] as const;

/**
 * Embeds sample code from samples/src into the JSDoc `@example` code blocks of
 * this package's src files.
 */
export const embedExamplesInJsDoc = async (): Promise<
  Result<undefined, unknown>
> =>
  embedExamplesInJsDocShared({
    packageRootPath: projectRootPath,
    sourceFileMappings,
    exemptSourcePaths,
  });

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedExamplesInJsDoc();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
