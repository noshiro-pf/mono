import 'webpack-dev-server';
import { webpackConfigSlidesDevMaker } from '../../../../config/webpackconfig/slides';
import { copyPaths } from './copy_paths';
import { dotenvValues } from './env';
import { paths } from './paths';

const webpackConfigMerged = webpackConfigSlidesDevMaker(
  paths,
  dotenvValues.HOST ?? 'localhost',
  Number(dotenvValues.PORT ?? 3000),
  'main.js',
  copyPaths
);

export default webpackConfigMerged;
