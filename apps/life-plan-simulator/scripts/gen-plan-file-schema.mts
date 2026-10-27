import * as fs from 'node:fs';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { PlanFile } from '../src/repository/index.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Writes `public/plan-file.schema.json`, the JSON Schema of the file the
 * "保存・読み込み" tab exports, from `PlanFile`. Vite copies `public/` as it is,
 * so the schema is served beside the app at the URL an exported file names in
 * `$schema`.
 *
 * The output is committed, and `plan-file.test.mts` fails when it is not what
 * this writes.
 */
const main = (): void => {
  const schema = t.toJsonSchema(PlanFile);

  if (Result.isErr(schema)) {
    throw new Error(
      `PlanFile has no JSON Schema: ${JSON.stringify(schema.value)}`,
    );
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(schema.value, undefined, 2)}\n`,
  );

  console.log(outputPath);
};

const outputPath = path.resolve(
  workspaceRootPath,
  'public/plan-file.schema.json',
);

main();
