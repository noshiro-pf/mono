// usage: yarn create:preact-app <new-app-name>

import 'zx/globals';
import { createNewPackageShared } from './create-new-package-shared.mjs';

await createNewPackageShared({
  newPackageName: argv._[0],
  templatePackageName: 'template-preact-app-vite',
  parentDirFromMonoRoot: '/packages/apps',
  templateDirName: '/template-preact-app-vite',
});
