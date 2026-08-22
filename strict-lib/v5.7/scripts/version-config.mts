import { type VersionConfig } from 'strict-ts-lib-scripts-common/context';

export const versionConfig = {
  libName: 'strict-ts-lib-v5.7',
  repo: 'https://github.com/noshiro-pf/strict-typescript-lib.git',
  license: 'Apache-2.0',
  typescriptVersion: '5.7.2',
  typescriptVersionRange: '>=5.7.0 <5.8.0',
} as const satisfies VersionConfig;
