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
    // In-source tests. `includeSource` defaults to a package's `src/` and
    // `samples/`, neither of which exists here, so without this an in-source
    // test block under `tools/` is dead code: nothing runs it and nothing
    // says so. A file named here is *imported* to be searched for one, which
    // is safe for these — every command script does its work behind
    // `isDirectlyExecuted(import.meta.url)`.
    //
    // Which of them Vitest actually collects is decided by searching the file
    // for the in-source marker as a literal string, so this comment
    // deliberately does not spell that marker out: writing it here made
    // Vitest collect this config as a test file and fail it for having no
    // test suite in it.
    includeSource: ['tools/{scripts,configs}/**/!(*.test).mts'],
  },
  browser: false,
});
