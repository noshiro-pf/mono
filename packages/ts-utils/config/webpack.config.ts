import * as path from 'path';
import * as webpack from 'webpack';
import { webpackConfigCommonMaker } from '../../../config/ts/webpack_config_common_maker';

const config: webpack.Configuration = webpackConfigCommonMaker(
  `${__dirname}/../src/index.ts`,
  path.resolve(process.cwd() + '/lib'),
  `${__dirname}/tsconfig.lib.json`
);

export default config;
