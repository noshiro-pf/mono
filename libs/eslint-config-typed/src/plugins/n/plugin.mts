import pluginN from 'eslint-plugin-n';
import { type ESLintPlugin } from '../../types/index.mjs';

export const eslintPluginN: Omit<ESLintPlugin, 'configs'> = pluginN as Omit<
  ESLintPlugin,
  'configs'
>;
