import { isDirectlyExecuted, Result } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { embedExamplesInJsDoc as embedExamplesInJsDocShared } from '../../../../tools/configs/embed-examples-in-jsdoc.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';
import { sourceFileMappings } from './embed-examples-in-jsdoc-map.mjs';

/**
 * `@example` blocks that are not backed by a sample file under `samples/src`
 * yet — the backlog of https://github.com/noshiro-pf/mono/issues/1880. The
 * coverage check fails on an entry that is no longer needed, so the list can
 * only shrink.
 */
const exemptSourcePaths: readonly string[] = [
  'src/constraints/with-constraints.mts',
  'src/primitives/number.mts',
  'src/primitives/string.mts',
  'src/record/at.mts',
] as const;

/**
 * Embeds sample code from samples/src into the JSDoc `@example` code blocks of
 * this package's src files.
 */
export const embedExamplesInJsDoc = async (): Promise<
  Result<undefined, unknown>
> =>
  embedExamplesInJsDocShared({
    packageRootPath: workspaceRootPath,
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
