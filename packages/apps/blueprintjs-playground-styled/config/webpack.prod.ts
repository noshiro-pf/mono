import { webpackConfigReactProdMaker } from '../../../../config/webpackconfig/react';
import { dotenvValues } from './env';
import { paths } from './paths';

console.log('use bundle analyzer: ', dotenvValues.USE_BUNDLE_ANALYZER);

const webpackConfigMerged = webpackConfigReactProdMaker(
  paths,
  'bundle.js',
  dotenvValues.USE_BUNDLE_ANALYZER
);

export default webpackConfigMerged;
