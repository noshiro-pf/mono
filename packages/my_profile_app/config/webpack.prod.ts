import 'webpack-dev-server';
import { webpackConfigReactProdMaker } from '../../../config/react/webpack_config_prod_maker';
import { dotenvValues } from './env';
import { paths } from './paths';

console.log('use bundle analyzer: ', dotenvValues.USE_BUNDLE_ANALYZER);

const webpackConfigMerged = webpackConfigReactProdMaker(
  paths,
  'bundle.js',
  dotenvValues.USE_BUNDLE_ANALYZER
);

export default webpackConfigMerged;
