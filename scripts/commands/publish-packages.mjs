import 'zx/globals';

const thisDir = import.meta.dirname;
const monoRootDir = path.resolve(thisDir, '../..');

/** @param {string} dir */
const buildPkg = async (dir) => {
  cd(`${monoRootDir}/${dir}`);
  await $`yarn build`;
};

/** @param {string} dir */
const publishPkg = async (dir) => {
  await $`yarn publish "${monoRootDir}/${dir}" --patch --no-git-tag-version --access=public`;
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
