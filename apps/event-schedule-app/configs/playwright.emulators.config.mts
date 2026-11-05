import { Arr } from 'ts-data-forge';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { definePlaywrightAppConfig } from '../../../tools/configs/playwright-config.mjs';

/**
 * The `@emulators` tests, which write to Firestore, run by
 * `check:e2e:emulators` inside `firebase emulators:exec`.
 *
 * The dev server it starts is told to use the emulators whatever a
 * `.env.development.local` says, and a dev server already running is never
 * reused, since it may have been started with `VITE_FIREBASE_EMULATORS=false`
 * and would have the tests write to the production Firestore: the port being
 * taken fails the run instead.
 */
const config = definePlaywrightAppConfig({ packageRoot: workspaceRootPath });

const { webServer } = config;

if (webServer === undefined || Arr.isArray(webServer)) {
  throw new Error('Expected the shared config to define one webServer');
}

export default {
  ...config,
  grep: /@emulators/u,
  use: { ...config.use, timezoneId: 'Asia/Tokyo' },
  webServer: {
    ...webServer,
    reuseExistingServer: false,
    env: { ...webServer.env, VITE_FIREBASE_EMULATORS: 'true' },
  },
} satisfies typeof config;
