import type { Paths } from '../../../../config/webpackconfig/react';
import { resolveAppPath } from './app_directory';
import { dotenvValues } from './env';

export const paths: Paths = {
  appBuild: resolveAppPath('build'),
  appIndexJs: resolveAppPath('src/index.tsx'),
  publicUrlOrPath: dotenvValues.PUBLIC_URL ?? '/',
  contentBase: resolveAppPath('public', true),
  tsconfigJson: resolveAppPath('tsconfig.json'),
};
