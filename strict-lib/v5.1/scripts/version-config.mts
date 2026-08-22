import { type VersionConfig } from 'strict-ts-lib-scripts-common/context';

export const versionConfig = {
  libName: 'strict-ts-lib-v5.1',
  repo: 'https://github.com/noshiro-pf/strict-typescript-lib.git',
  license: 'Apache-2.0',
  typescriptVersion: '5.1.6',
  typescriptVersionRange: '>=5.1.0 <5.2.0',
} as const satisfies VersionConfig;
