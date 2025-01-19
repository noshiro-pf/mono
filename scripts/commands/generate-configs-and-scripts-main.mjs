import {
  execAsync,
  generateCypressDirectory,
  generateEsLintConfig,
  generateEsLintConfigForGlobalUtils,
  generateInjectDef,
  generatePlaywrightConfig,
  generateRollupConfigForUtils,
  generateTsConfigForBuild,
  generateTsConfigForTest,
  generateTsConfigForTypeCheck,
  generateViteConfig,
  generateVitestConfigForUtils,
  getWorkspaces,
  updatePackageJson,
} from '../esm/index.mjs';

/** Flags to filter execution */
const executeFlag = {
  typeCheck: true,
  build: true,
  test: true,
  packageJson: true,
  eslintConfig: true,
  rollupConfig: true,
  viteConfig: true,
  vitestConfig: true,
  e2e: true,
};

/**
 * Generate configuration files such as "eslint.config.js", "tsconfig.json",
 * "vitest.config.ts", and "package.json".
 *
 * @returns {Promise<void>}
 */
const main = async () => {
  const workspaces = await getWorkspaces();

  for (const workspace of workspaces) {
    if (
      workspace.location === 'packages/strict-ts-lib/source' ||
      workspace.location.startsWith('packages/utils') ||
      workspace.location === 'packages/ts-type-utils' ||
      workspace.location === 'packages/eslint-configs' ||
      workspace.location === 'packages/apps/lambda-calculus-interpreter-core' ||
      workspace.location === 'packages/apps/event-schedule-app-shared'
    ) {
      // utils

      const packageName = workspace.location
        .replace('packages/ts-type-utils', 'ts-type-utils')
        .replace('packages/eslint-configs', 'eslint-configs')
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
        executeFlag.rollupConfig
          ? generateRollupConfigForUtils(workspace.location, packageName)
          : undefined,
        executeFlag.vitestConfig
          ? generateVitestConfigForUtils(workspace.location, packageName)
          : undefined,
        executeFlag.packageJson
          ? updatePackageJson(workspace, packageName)
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
      // apps

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
          ? updatePackageJson(workspace, packageName)
          : undefined,

        // event-schedule-app の eslint config だけカスタマイズが多いため自動生成対象から除外
        executeFlag.eslintConfig && packageName !== 'event-schedule-app'
          ? generateEsLintConfig(workspace.location, packageName)
          : undefined,

        executeFlag.e2e
          ? generateCypressDirectory(workspace.location, packageName)
          : undefined,
        executeFlag.e2e && packageName !== 'event-schedule-app'
          ? generatePlaywrightConfig(workspace.location, packageName)
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
