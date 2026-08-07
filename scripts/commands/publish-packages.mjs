import 'zx/globals';

const thisDir = import.meta.dirname;
const monoRootDir = path.resolve(thisDir, '../..');

/** @param {string} dir */
const buildPkg = async (dir) => {
  cd(`${monoRootDir}/${dir}`);
  await $`pnpm run build`;
};

/**
 * `pnpm publish` does not bump the version the way `pnpm run publish --patch` did,
 * so the bump is a separate step. `--no-git-checks` keeps the previous
 * behaviour of publishing without requiring a clean branch.
 *
 * @param {string} dir
 */
const publishPkg = async (dir) => {
  cd(`${monoRootDir}/${dir}`);
  await $`pnpm version patch --no-git-tag-version`;
  await $`pnpm publish --access public --no-git-checks`;
};

/** @param {string} dir */
const buildAndPublishPkg = async (dir) => {
  await buildPkg(dir);
  await publishPkg(dir);
};

await buildAndPublishPkg('packages/utils/ts-utils');
await buildAndPublishPkg('packages/utils/syncflow');
await buildAndPublishPkg('packages/utils/syncflow-preact-hooks');
await buildAndPublishPkg('packages/utils/syncflow-react-hooks');
await buildAndPublishPkg('packages/apps/event-schedule-app-shared');
await buildAndPublishPkg('packages/utils/ts-utils');
await buildAndPublishPkg('packages/tools/eslint-custom-rules');
