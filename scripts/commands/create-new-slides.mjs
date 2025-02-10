// usage: yarn create:slides <new-slides-name>

import 'zx/globals';
import { createNewPackageShared } from './create-new-package-shared.mjs';

await createNewPackageShared({
  newPackageName: argv._[0],
  templatePackageName: 'slides-template',
  parentDirFromMonoRoot: '/packages/slides',
  templateDirName: '/template',
});
