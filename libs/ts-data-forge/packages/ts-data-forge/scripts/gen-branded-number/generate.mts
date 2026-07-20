import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { projectRootPath } from '../project-root-path.mjs';
import { brandedNumberConfigs } from './config.mjs';
import { renderModule } from './render.mjs';

/**
 * Generates every configured branded-number module under `src/number`. Worked
 * `@example` blocks are emitted as empty placeholders; run
 * `pnpm run doc:embed:jsdoc` afterwards to fill them, then Prettier to
 * normalize formatting.
 */
const main = async (): Promise<void> => {
  for (const config of brandedNumberConfigs) {
    const filePath = path.resolve(
      projectRootPath,
      `./src/number/${config.dir}/${config.kebabName}.mts`,
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(filePath, renderModule(config));

    console.info(`Generated ${path.relative(projectRootPath, filePath)}`);
  }
};

await main();
