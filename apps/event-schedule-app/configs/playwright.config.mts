import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { definePlaywrightAppConfig } from '../../../tools/configs/playwright-config.mjs';

export default {
  ...definePlaywrightAppConfig({ packageRoot: workspaceRootPath }),

  // Left out of every run of this config — `check:e2e`, one spec named on the
  // command line, an editor's test runner — because they write to Firestore and
  // this config reuses a dev server that may be on the production project.
  // `@emulators` runs through `playwright.emulators.config.mts`, `@production`
  // through `playwright.production.config.mts`.
  grepInvert: /@emulators|@production/u,
};
