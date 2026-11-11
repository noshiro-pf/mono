import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { workspaceRootPath } from '../workspace-root-path.mjs';
import { brandedNumberConfigs, findAbsTypeProblems } from './config.mjs';
import { renderModule, renderOperatorsModule } from './render.mjs';

/**
 * Generates every configured branded-number module under `src/number`, and the
 * module under `src/number/operators` that each one reads its operators from.
 * Worked `@example` blocks are emitted as empty placeholders; run
 * `pnpm run gen:jsdoc` afterwards to fill them, then Prettier to normalize
 * formatting.
 */
const main = async (): Promise<void> => {
  const problems = findAbsTypeProblems(brandedNumberConfigs);

  if (problems.length > 0) {
    throw new Error(
      ['A config would document `abs` wrongly:', ...problems].join('\n'),
    );
  }

  for (const config of brandedNumberConfigs) {
    const filePath = path.resolve(
      workspaceRootPath,
      `./src/number/${config.dir}/${config.kebabName}.mts`,
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(filePath, renderModule(config));

    console.info(`Generated ${path.relative(workspaceRootPath, filePath)}`);

    const operatorsPath = path.resolve(
      workspaceRootPath,
      `./src/number/operators/${config.kebabName}.mts`,
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(operatorsPath, renderOperatorsModule(config));

    console.info(
      `Generated ${path.relative(workspaceRootPath, operatorsPath)}`,
    );
  }
};

await main();
