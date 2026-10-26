import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { formatFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../../project-root-path.mjs';
import { ConfigFileSchema } from './config.mjs';

/** Where the generated schema is written. */
export const CONFIG_SCHEMA_PATH = path.join(
  import.meta.dirname,
  'config.schema.json',
);

/** `config.schema.json`'s content, before Prettier lays it out. */
export const configJsonSchema = (): Result<unknown, string> => {
  const schema = t.toJsonSchema(ConfigFileSchema);

  return Result.isErr(schema)
    ? Result.err(
        `❌ config.mts has no JSON Schema: ${JSON.stringify(schema.value)}`,
      )
    : schema;
};

/** Writes `config.schema.json` from {@link ConfigFileSchema}. */
export const genConfigSchema = async (): Promise<Result<undefined, string>> => {
  const schema = configJsonSchema();

  if (Result.isErr(schema)) {
    return schema;
  }

  await fs.writeFile(CONFIG_SCHEMA_PATH, JSON.stringify(schema.value), 'utf8');

  const formatted = await formatFiles([CONFIG_SCHEMA_PATH], { silent: true });

  return Result.isErr(formatted)
    ? Result.err(
        `❌ Failed to format ${path.relative(projectRootPath, CONFIG_SCHEMA_PATH)}.`,
      )
    : Result.ok(undefined);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await genConfigSchema();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
