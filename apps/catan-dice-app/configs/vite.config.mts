import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteAppConfig } from '../../../tools/configs/vite-app-config.mjs';

export default defineViteAppConfig({
  packageRoot: workspaceRootPath,
  framework: 'react',
  jsxImportSource: '@emotion/react',
});
