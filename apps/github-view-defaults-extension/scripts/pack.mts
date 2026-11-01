// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules -- tools/ is not a package; this is how apps reach its shared scripts
import { packExtensionZip } from '../../../tools/configs/chrome-extension-packaging.mjs';
import { storePackageOptions } from './store-package.mjs';

packExtensionZip(storePackageOptions);
