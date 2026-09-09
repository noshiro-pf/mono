import { projectRootPath } from '../scripts/project-root-path.mjs';
import { defineViteConfig } from './vite-config.mjs';

/**
 * The Vitest project for `tools/`.
 *
 * `tools/configs/` and `tools/scripts/` deliberately have no `package.json` —
 * they are plain directories consumed by relative path, not workspace members
 * (see CLAUDE.md, "Repository Layout"). So `ws:test`, which runs each member's
 * own `test` script, never reaches them, and a config of their own is the only
 * way their tests run at all. `check:root:test` is what runs this, which puts
 * it behind the same `type-check (check:root)` context as the rest of
 * `check:root`.
 */
export default defineViteConfig({
  packageRoot: projectRootPath,
  node: {
    include: ['tools/{scripts,configs}/**/*.test.mts'],
  },
  browser: false,
});
