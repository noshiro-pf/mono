import { isNotUndefined } from '../ts-utils/index.mjs';
import { type WorkspaceConfig } from './workspace-config-type.mjs';

export const tsConfigExtend = (
  tsType: WorkspaceConfig['tsType'],
  pathPrefixToRoot: string,
  baseTsConfigName: string,
  isViteApp: boolean,
): string | readonly string[] => {
  const pathToSharedTsConfig = `${pathPrefixToRoot}/config/tsconfig`;

  switch (tsType) {
    case 'mts':
      return isViteApp
        ? [
            `${pathToSharedTsConfig}/${baseTsConfigName}`,
            `${pathToSharedTsConfig}/tsconfig.vite.json`,
          ]
        : `${pathToSharedTsConfig}/${baseTsConfigName}`;

    case 'react':
      return [
        `${pathToSharedTsConfig}/${baseTsConfigName}`,
        `${pathToSharedTsConfig}/tsconfig.react.json`,
        isViteApp
          ? [
              `${pathToSharedTsConfig}/tsconfig.vite.json`,
              `${pathToSharedTsConfig}/tsconfig.absolute-path.json`,
            ]
          : undefined,
      ]
        .flat()
        .filter(isNotUndefined);

    case 'react-emotion':
      return [
        `${pathToSharedTsConfig}/${baseTsConfigName}`,
        `${pathToSharedTsConfig}/tsconfig.react-emotion.json`,
        isViteApp
          ? [
              `${pathToSharedTsConfig}/tsconfig.vite.json`,
              `${pathToSharedTsConfig}/tsconfig.absolute-path.json`,
            ]
          : undefined,
      ]
        .flat()
        .filter(isNotUndefined);

    case 'preact':
      return [
        `${pathToSharedTsConfig}/${baseTsConfigName}`,
        `${pathToSharedTsConfig}/tsconfig.preact.json`,
        isViteApp
          ? [
              `${pathToSharedTsConfig}/tsconfig.vite.json`,
              `${pathToSharedTsConfig}/tsconfig.absolute-path.json`,
            ]
          : undefined,
      ]
        .flat()
        .filter(isNotUndefined);

    default:
      return [];
  }
};
