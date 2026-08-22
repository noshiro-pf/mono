import { type VersionConfig } from 'strict-ts-lib-scripts-common/context';

export const versionConfig = {
  libName: 'strict-ts-lib-v5.5',
  repo: 'https://github.com/noshiro-pf/strict-typescript-lib.git',
  license: 'Apache-2.0',
  typescriptVersion: '5.5.4',
  typescriptVersionRange: '>=5.5.0 <5.6.0',
} as const satisfies VersionConfig;
