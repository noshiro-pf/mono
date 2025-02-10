// usage: yarn create:react-app <new-app-name>

import 'zx/globals';
import { createNewPackageShared } from './create-new-package-shared.mjs';

await createNewPackageShared({
  newPackageName: argv._[0],
  templatePackageName: 'template-react-app-vite',
  parentDirFromMonoRoot: '/packages/apps',
  templateDirName: '/template-react-app-vite',
});
