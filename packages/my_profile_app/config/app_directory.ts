import * as fs from 'fs';
import { pathResolverMaker } from '../../../scripts/path_resolver_maker';

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());

export const resolveAppPath = pathResolverMaker(appDirectory);
