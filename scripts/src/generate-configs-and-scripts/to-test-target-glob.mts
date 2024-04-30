import { type WorkspaceConfig } from './workspace-config-type.mjs';

export const toTestTargetGlob = (cfg: WorkspaceConfig): string => {
  const srcDirStr =
    cfg.srcDirs.length >= 2 ? `(${cfg.srcDirs.join('|')})` : cfg.srcDirs[0];

  const ext = cfg.tsType?.includes('react') === true ? '{mts,tsx}' : 'mts';

  return `${srcDirStr}/**/*.test.${ext}`;
};
