import { type VersionConfig } from 'strict-ts-lib-scripts-common/context';

export const versionConfig = {
  libName: 'strict-ts-lib-v5.4',
  repo: 'https://github.com/noshiro-pf/strict-typescript-lib.git',
  license: 'Apache-2.0',
  typescriptVersion: '5.4.5',
  typescriptVersionRange: '>=5.4.0 <5.5.0',
} as const satisfies VersionConfig;
