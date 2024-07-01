import { type WorkspaceConfig } from './workspace-config-type.mjs';

export const toTestTargetGlob = (cfg: WorkspaceConfig): readonly string[] => {
  const ext = cfg.tsType?.includes('react') === true ? '{mts,tsx}' : 'mts';

  return cfg.srcDirs.map((d) => `${d}/**/*.test.${ext}`);
};
