import { isNotUndefined } from '../ts-utils/index.mjs';
import { type WorkspaceConfig } from './workspace-config-type.mjs';

export const tsConfigExtend = (
  tsType: WorkspaceConfig['tsType'],
  pathPrefixToRoot: string,
  baseTsConfigName: string,
  useVite: boolean | 'vitest-only',
): string | readonly string[] => {
  const pathToSharedTsConfig = `${pathPrefixToRoot}/configs/tsconfig`;

  switch (tsType) {
    case 'mts':
      return useVite !== false
        ? [
            `${pathToSharedTsConfig}/${baseTsConfigName}`,
            `${pathToSharedTsConfig}/tsconfig.vite.json`,
          ]
        : `${pathToSharedTsConfig}/${baseTsConfigName}`;

    case 'dom':
      return useVite !== false
        ? [
            `${pathToSharedTsConfig}/${baseTsConfigName}`,
            `${pathToSharedTsConfig}/tsconfig.dom.json`,
            `${pathToSharedTsConfig}/tsconfig.vite.json`,
          ]
        : [
            `${pathToSharedTsConfig}/${baseTsConfigName}`,
            `${pathToSharedTsConfig}/tsconfig.dom.json`,
          ];

    case 'react':
      return [
        `${pathToSharedTsConfig}/${baseTsConfigName}`,
        `${pathToSharedTsConfig}/tsconfig.react.json`,
        useVite === true
          ? [
              `${pathToSharedTsConfig}/tsconfig.vite.json`,
              `${pathToSharedTsConfig}/tsconfig.absolute-path.json`,
            ]
          : useVite === 'vitest-only'
            ? [`${pathToSharedTsConfig}/tsconfig.vite.json`]
            : undefined,
      ]
        .flat()
        .filter(isNotUndefined);

    case 'react-emotion':
      return [
        `${pathToSharedTsConfig}/${baseTsConfigName}`,
        `${pathToSharedTsConfig}/tsconfig.react-emotion.json`,
        useVite === true
          ? [
              `${pathToSharedTsConfig}/tsconfig.vite.json`,
              `${pathToSharedTsConfig}/tsconfig.absolute-path.json`,
            ]
          : useVite === 'vitest-only'
            ? [`${pathToSharedTsConfig}/tsconfig.vite.json`]
            : undefined,
      ]
        .flat()
        .filter(isNotUndefined);

    case 'preact':
      return [
        `${pathToSharedTsConfig}/${baseTsConfigName}`,
        `${pathToSharedTsConfig}/tsconfig.preact.json`,
        useVite === true
          ? [
              `${pathToSharedTsConfig}/tsconfig.vite.json`,
              `${pathToSharedTsConfig}/tsconfig.absolute-path.json`,
            ]
          : useVite === 'vitest-only'
            ? [`${pathToSharedTsConfig}/tsconfig.vite.json`]
            : undefined,
      ]
        .flat()
        .filter(isNotUndefined);

    case undefined:
      return [];
  }
};
