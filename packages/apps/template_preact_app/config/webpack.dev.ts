import 'webpack-dev-server';
import { webpackConfigReactDevMaker } from '../../../../config/webpackconfig/react';
import { dotenvValues } from './env';
import { paths } from './paths';

const webpackConfigMerged = webpackConfigReactDevMaker(
  paths,
  dotenvValues.HOST ?? 'localhost',
  Number(dotenvValues.PORT ?? 3000),
  'bundle.js'
);

export default webpackConfigMerged;
