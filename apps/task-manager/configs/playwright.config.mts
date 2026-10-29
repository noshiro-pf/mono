import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { definePlaywrightAppConfig } from '../../../tools/configs/playwright-config.mjs';

const config = definePlaywrightAppConfig({ packageRoot: workspaceRootPath });

export default {
  ...config,
  use: {
    ...config.use,
    // The page follows the browser's language, and the specs read its
    // Japanese; `e2e/language.spec.mts` switches to English itself.
    locale: 'ja-JP',
  },
};
