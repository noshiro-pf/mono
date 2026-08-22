import { type VersionConfig } from 'strict-ts-lib-scripts-common/context';

export const versionConfig = {
  libName: 'strict-ts-lib-v5.8',
  repo: 'https://github.com/noshiro-pf/strict-typescript-lib.git',
  license: 'Apache-2.0',
  typescriptVersion: '5.8.3',
  typescriptVersionRange: '>=5.8.0 <5.9.0',
} as const satisfies VersionConfig;
