import { execAsync } from '../node-utils/child-process-async.mjs';
import { getWorkspaces } from '../others/get-workspaces.mjs';
import { generateCypressDirectory } from './generate-cypress-directory.mjs';
import { generateEsLintConfigForGlobalUtils } from './generate-eslint-config-for-global-utils.mjs';
import { generateEsLintConfig } from './generate-eslint-config-for-utils.mjs';
import { generateInjectDef } from './generate-inject-def.mjs';
import { generateTsConfigForBuild } from './generate-ts-config-for-build.mjs';
import { generateTsConfigForTest } from './generate-ts-config-for-test.mjs';
import { generateTsConfigForTypeCheck } from './generate-ts-config-for-type-check.mjs';
import { generateViteConfig } from './generate-vite-config.mjs';
import { generateVitestConfigForUtils } from './generate-vitest-config-for-utils.mjs';
import { updatePackageJson } from './update-package-json.mjs';

const executeFlag = {
  typeCheck: true,
  build: true,
  test: true,
  packageJson: true,
  eslintConfig: true,
  viteConfig: true,
  vitestConfig: true,
  cypress: true,
};

const main = async () => {
  const workspaces = await getWorkspaces();

  // utils
  for (const workspace of workspaces) {
    if (
      workspace.location === 'packages/strict-ts-lib/source' ||
      workspace.location.startsWith('packages/utils') ||
      workspace.location === 'packages/apps/lambda-calculus-interpreter-core' ||
      workspace.location === 'packages/apps/event-schedule-app-shared'
    ) {
      const packageName = workspace.location
        .replace('packages/utils/', '')
        .replace('packages/apps/', '')
        .replace('packages/strict-ts-lib/source', 'strict-ts-lib');

      if (packageName === 'blueprint-css') continue;
      if (packageName === 'goober') continue;

      await Promise.all([
        executeFlag.typeCheck
          ? generateTsConfigForTypeCheck(workspace.location, packageName)
          : undefined,
        executeFlag.build
          ? generateTsConfigForBuild(workspace.location, packageName)
          : undefined,
        executeFlag.test
          ? generateTsConfigForTest(workspace.location, packageName)
          : undefined,
        executeFlag.vitestConfig
          ? generateVitestConfigForUtils(workspace.location, packageName)
          : undefined,
        executeFlag.packageJson
          ? updatePackageJson(workspace.location, packageName)
          : undefined,
        executeFlag.eslintConfig
          ? packageName.startsWith('global-')
            ? generateEsLintConfigForGlobalUtils(
                workspace.location,
                packageName,
              )
            : generateEsLintConfig(workspace.location, packageName)
          : undefined,
      ]);
    } else if (
      workspace.location.startsWith('packages/apps') &&
      !workspace.location.endsWith('/cypress')
    ) {
      if (
        workspace.location === 'packages/apps/event-schedule-app/functions' ||
        workspace.location === 'packages/apps/slack-app/functions' ||
        workspace.location === 'packages/apps/poll-discord-app'
      ) {
        continue; // skip
      }

      const packageName = workspace.location.replace('packages/apps/', '');

      await Promise.all([
        executeFlag.typeCheck
          ? generateTsConfigForTypeCheck(workspace.location, packageName)
          : undefined,
        executeFlag.test
          ? generateTsConfigForTest(workspace.location, packageName)
          : undefined,
        executeFlag.viteConfig
          ? generateViteConfig(workspace.location, packageName)
          : undefined,
        executeFlag.viteConfig || executeFlag.vitestConfig
          ? generateInjectDef(workspace.location, packageName)
          : undefined,
        executeFlag.packageJson
          ? updatePackageJson(workspace.location, packageName)
          : undefined,
        executeFlag.eslintConfig && packageName !== 'event-schedule-app'
          ? generateEsLintConfig(workspace.location, packageName)
          : undefined,
        executeFlag.cypress
          ? generateCypressDirectory(workspace.location, packageName)
          : undefined,
      ]);
    }
  }

  console.log('formatting...');
  await execAsync('yarn fmt:diff');
  console.log('done.');
};

main().catch((error) => {
  console.error(error);
});
