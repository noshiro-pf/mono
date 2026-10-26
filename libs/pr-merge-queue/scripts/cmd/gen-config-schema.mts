import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { formatFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { ConfigFileSchema } from '../../src/unblock-prs/index.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Writes `src/unblock-prs/config.schema.json` from `ConfigFileSchema`; the
 * test beside it holds the committed file to the same output.
 */
export const genConfigSchema = async (): Promise<Result<undefined, string>> => {
  const schema = t.toJsonSchema(ConfigFileSchema);

  if (Result.isErr(schema)) {
    return Result.err(
      `❌ ConfigFileSchema has no JSON Schema: ${JSON.stringify(schema.value)}`,
    );
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed paths in this package
  await fs.writeFile(outputPath, JSON.stringify(schema.value), 'utf8');

  const formatted = await formatFiles([outputPath], { silent: true });

  return Result.isErr(formatted)
    ? Result.err(`❌ Failed to format ${outputPath}.`)
    : Result.ok(undefined);
};

const outputPath = path.resolve(
  projectRootPath,
  'src/unblock-prs/config.schema.json',
);

if (isDirectlyExecuted(import.meta.url)) {
  const result = await genConfigSchema();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
