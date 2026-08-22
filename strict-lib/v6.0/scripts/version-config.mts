import { type VersionConfig } from 'strict-ts-lib-scripts-common/context';

export const versionConfig = {
  libName: 'strict-ts-lib-v6.0',
  repo: 'https://github.com/noshiro-pf/strict-typescript-lib.git',
  license: 'Apache-2.0',
  typescriptVersion: '6.0.3',
  typescriptVersionRange: '>=6.0.0 <6.1.0',
} as const satisfies VersionConfig;
