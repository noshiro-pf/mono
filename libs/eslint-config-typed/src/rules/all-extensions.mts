const allExtensions = [
  'js',
  'ts',
  'd.ts',
  'mjs',
  'mts',
  'd.mts',
  'cjs',
  'cts',
  'd.cts',
  'jsx',
  'tsx',
] as const;

export const allExtensionsStr = allExtensions.join(',');
export const allExtensionsRegexUnionStr = allExtensions.join('|');
