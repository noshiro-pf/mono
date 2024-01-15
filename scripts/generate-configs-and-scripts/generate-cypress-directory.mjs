import * as fs from 'fs/promises';
import { execAsync } from '../node-utils/child-process-async.mjs';
import { zeros } from '../ts-utils/utils.mjs';

/**
 * @param {string} workspaceLocation
 * @param {string} packageName
 */
export const generateCypressDirectory = async (
  workspaceLocation,
  packageName,
) => {
  const depth = workspaceLocation.split('/').length + 1;

  const pathPrefixToRoot = zeros(depth)
    .map(() => '..')
    .join('/');

  await fs.writeFile(
    `${workspaceLocation}/cypress/package.json`,
    JSON.stringify({
      name: `@noshiro/${packageName}-cypress`,
      version: '0.0.0',
      type: 'module',
      scripts: {
        'cy:open': 'cypress open',
        // eslint-disable-next-line no-template-curly-in-string
        'cy:record': 'cypress run --record --key ${CYPRESS_RECORD_KEY}',
        'cy:run:chrome': 'cypress run --headed --browser chrome ',
        'cy:run:firefox': 'cypress run --headed --browser firefox ',
        'start:dev-server': `yarn workspace @noshiro/${packageName} start:dev-server`,
        'start:emulators': `yarn workspace @noshiro/${packageName} start:emulators`,
        'start:emulators:e2e': `yarn workspace @noshiro/${packageName} start:emulators:e2e`,
      },
    }),
  );

  await fs.writeFile(
    `${workspaceLocation}/cypress/tsconfig.json`,
    JSON.stringify({
      extends: `${pathPrefixToRoot}/config/tsconfig/tsconfig.type-check.json`,
      include: ['./cypress.config.ts', './cypress'],
    }),
  );

  await fs.writeFile(
    `${workspaceLocation}/cypress/cypress/tsconfig.json`,
    JSON.stringify({
      extends: `${pathPrefixToRoot}/../config/tsconfig/tsconfig.type-check.json`,
      include: ['./**/*.ts'],
    }),
  );

  try {
    const from = `${workspaceLocation}/cypress.config.ts`;
    await fs.access(from);
    await execAsync(`mv ${from} ${workspaceLocation}/cypress`);
  } catch {
    /* empty */
  }
};
