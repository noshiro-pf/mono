import webpack from 'webpack';
import { webpackConfigSlidesProdMaker } from '../../../../config/slides/webpack_config_prod_maker';
import { copyPaths } from './copy_paths';
import { dotenvValues } from './env';
import { paths } from './paths';

console.log('use bundle analyzer: ', dotenvValues.USE_BUNDLE_ANALYZER);

const config: webpack.Configuration = webpackConfigSlidesProdMaker(
  paths,
  'main.js',
  copyPaths,
  dotenvValues.USE_BUNDLE_ANALYZER
);

export default config;
