/**
 * @param {import("./workspace-config-type.mjs").WorkspaceConfig} cfg
 * @returns {string}
 */
export const toTestTargetGlob = (cfg) => {
  const srcDirStr =
    cfg.srcDirs.length >= 2 ? `(${cfg.srcDirs.join('|')})` : cfg.srcDirs[0];

  const ext = cfg.tsType?.includes('react') === true ? '{mts,tsx}' : 'mts';

  return `${srcDirStr}/**/*.test.${ext}`;
};
