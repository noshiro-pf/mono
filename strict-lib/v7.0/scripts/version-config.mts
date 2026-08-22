import { type VersionConfig } from 'strict-ts-lib-scripts-common/context';

export const versionConfig = {
  libName: 'strict-ts-lib-v7.0',
  repo: 'https://github.com/noshiro-pf/strict-typescript-lib.git',
  license: 'Apache-2.0',
  typescriptVersion: '7.0.2',
  typescriptVersionRange: '>=7.0.0 <7.1.0',
  // TypeScript 7.0 (the native port) develops and ships its lib files from
  // `microsoft/typescript-go`; `microsoft/TypeScript` has no `v7.0.2` tag.
  libSource: {
    repo: 'microsoft/typescript-go',
    ref: 'typescript/v7.0.2',
    dir: 'internal/bundled/libs',
  },
} as const satisfies VersionConfig;
