import * as path from 'node:path';
import { Result } from 'ts-data-forge';
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules -- tools/ is not a package; this is how apps reach its shared scripts
import { genCssModuleTypes } from '../../../../tools/configs/gen-css-module-types.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const result = await genCssModuleTypes({
  srcDir: path.resolve(workspaceRootPath, './src'),
  viteConfigFile: path.resolve(workspaceRootPath, './configs/vite.config.mts'),
});

if (Result.isErr(result)) {
  console.error(result.value);

  process.exit(1);
}
