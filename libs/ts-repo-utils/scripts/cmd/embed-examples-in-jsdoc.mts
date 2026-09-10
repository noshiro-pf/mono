import { isDirectlyExecuted, Result } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { embedExamplesInJsDoc as embedExamplesInJsDocShared } from '../../../../tools/configs/embed-examples-in-jsdoc.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { sourceFileMappings } from './embed-examples-in-jsdoc-map.mjs';

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
  });

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedExamplesInJsDoc();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
