import 'zx/globals';
import { paths } from './constants.mjs';
import { getPackageDirList } from './get-package-dir-list.mjs';

export const publishPackages = async (): Promise<void> => {
  const directories: readonly string[] = await getPackageDirList().then(
    (list) =>
      list.map((a) =>
        path.resolve(
          paths.strictTsLib.output.packages.$,
          a.packageRelativePath,
        ),
      ),
  );

  console.log('target directories:', directories);

  await Promise.all(
    directories.map((directory) =>
      within(async () => {
        cd(directory);
        echo(directory);

        await $`npm publish`;
      }),
    ),
  );

  cd(paths.strictTsLib.output.lib.$);
  echo(paths.strictTsLib.output.lib.$);
  await $`npm publish`;

  echo(' ');
  echo(' ');

  console.log(
    chalk.green(
      "Don't forget to publish the latest version of @noshiro/ts-type-utils if you haven't done so already.",
    ),
  );
};
