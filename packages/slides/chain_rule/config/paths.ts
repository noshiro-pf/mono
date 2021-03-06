import type { Paths } from '../../../../config/webpackconfig/slides';
import { resolveAppPath } from './app_directory';
import { dotenvValues } from './env';

export const paths: Paths = {
  appBuild: resolveAppPath('dist'),
  contentBase: resolveAppPath('public', true),
  template: resolveAppPath('public/index.html'),
  appIndexJs: resolveAppPath('public/index.js'),
  publicUrlOrPath: dotenvValues.PUBLIC_URL ?? '/',
};
