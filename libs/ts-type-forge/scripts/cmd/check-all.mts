import { assertRepoIsDirty } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await $(`cd ${projectRootPath}`);

await $('npm i');

await $(
  'cspell "**" --gitignore --gitignore-root ./ --no-progress --fail-fast',
).catch(() => {
  console.error('Spell check failed, try `npm run cspell` for more details.');
  process.exit(1);
});

await $('npm run check:ext');

await $('npm run type-check');

await $('npm run lint:fix');
await assertRepoIsDirty();

await $('npm run build');
await assertRepoIsDirty();

await $('npm run doc');
await assertRepoIsDirty();

await $('npm run fmt');
await assertRepoIsDirty();
