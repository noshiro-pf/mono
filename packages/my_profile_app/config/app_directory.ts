import * as fs from 'fs';
import { appPathResolverMaker } from '../../../config/react/app_path_resolver_maker';

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());

export const resolveAppPath = appPathResolverMaker(appDirectory);
