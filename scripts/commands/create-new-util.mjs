// usage: yarn create:util <new-util-name>

import 'zx/globals';
import { createNewPackageShared } from './create-new-package-shared.mjs';

await createNewPackageShared({
  newPackageName: argv._[0],
  templatePackageName: 'template-utils',
  parentDirFromMonoRoot: '/packages/utils',
  templateDirName: '/template',
});
