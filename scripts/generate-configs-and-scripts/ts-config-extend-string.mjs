/** @typedef {import('./workspace-config-type.mjs').WorkspaceConfig} WorkspaceConfig */

import { isNotUndefined } from '../ts-utils/guard.mjs';

/**
 * @param {WorkspaceConfig["tsType"]} tsType
 * @param {string} pathPrefixToRoot
 * @param {string} baseTsConfigName
 * @param {boolean} isViteApp
 * @returns {readonly string[]}
 */

export const tsConfigExtendString = (
  tsType,
  pathPrefixToRoot,
  baseTsConfigName,
  isViteApp,
) => {
  const pathToSharedTsConfig = `${pathPrefixToRoot}/config/tsconfig`;

  switch (tsType) {
    case 'mts':
      return isViteApp
        ? [
            '"extends": [',
            [
              `"${pathToSharedTsConfig}/${baseTsConfigName}"`,
              `"${pathToSharedTsConfig}/tsconfig.vite.json"`,
            ].join(','),
            ']',
          ]
        : [`"extends":`, `"${pathToSharedTsConfig}/${baseTsConfigName}"`];

    case 'react':
      return [
        '"extends": [',
        [
          `"${pathToSharedTsConfig}/${baseTsConfigName}"`,
          `"${pathToSharedTsConfig}/tsconfig.react.json"`,
          isViteApp
            ? [
                `"${pathToSharedTsConfig}/tsconfig.vite.json"`,
                `"${pathToSharedTsConfig}/tsconfig.absolute-path.json"`,
              ]
            : undefined,
        ]
          .flat()
          .filter(isNotUndefined)
          .join(','),
        ']',
      ];

    case 'react-emotion':
      return [
        '"extends": [',
        [
          `"${pathToSharedTsConfig}/${baseTsConfigName}"`,
          `"${pathToSharedTsConfig}/tsconfig.react-emotion.json"`,
          isViteApp
            ? [
                `"${pathToSharedTsConfig}/tsconfig.vite.json"`,
                `"${pathToSharedTsConfig}/tsconfig.absolute-path.json"`,
              ]
            : undefined,
        ]
          .flat()
          .filter(isNotUndefined)
          .join(','),
        ']',
      ];

    case 'preact':
      return [
        '"extends": [',
        [
          `"${pathToSharedTsConfig}/${baseTsConfigName}"`,
          `"${pathToSharedTsConfig}/tsconfig.preact.json"`,
          isViteApp
            ? [
                `"${pathToSharedTsConfig}/tsconfig.vite.json"`,
                `"${pathToSharedTsConfig}/tsconfig.absolute-path.json"`,
              ]
            : undefined,
        ]
          .flat()
          .filter(isNotUndefined)
          .join(','),
        ']',
      ];

    default:
      return [];
  }
};
