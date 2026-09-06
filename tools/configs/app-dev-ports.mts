import * as path from 'node:path';
import { hasKey, isRecord } from 'ts-data-forge';

/**
 * The dev-server port for each app under `apps/`, in one place.
 *
 * In the pre-2026 monorepo every app's Vite config said 5180 and every
 * Playwright config pointed at `http://localhost:5180`. Two apps could not run
 * at once, and — worse for a test run — `reuseExistingServer` would happily
 * attach to whichever app's server was already up, so an e2e suite could pass
 * against a different application than the one it was written for.
 *
 * The numbers are arbitrary; that they are distinct is the point.
 */
const appDevPorts = {
  'algo-app': 5181,
  'annotation-tool': 5182,
  'blueprintjs-playground': 5183,
  'blueprintjs-playground-styled': 5184,
  'cant-stop-probability-app': 5185,
  'catan-dice-app': 5186,
  'color-demo-app': 5187,
  'event-schedule-app': 5188,
  'housing-loan-calculator-app': 5189,
  'lambda-calculus-interpreter-preact': 5190,
  'lambda-calculus-interpreter-react': 5191,
  'mahjong-calculator-app': 5192,
  'my-portfolio-app-preact': 5193,
} as const;

/**
 * The port for the app rooted at `packageRoot`, keyed by directory name so that
 * neither the Vite config nor the Playwright config has to repeat the number.
 *
 * Throws rather than falling back to Vite's default: two apps sharing a port is
 * the failure this table exists to prevent, and a silent default would bring it
 * straight back.
 */
export const appDevPort = (packageRoot: string): number => {
  const name = path.basename(packageRoot);

  if (!(isRecord(appDevPorts) && hasKey(appDevPorts, name))) {
    throw new Error(
      `appDevPort: no port for "${name}". Add it to tools/configs/app-dev-ports.mts.`,
    );
  }

  return appDevPorts[name as keyof typeof appDevPorts];
};
