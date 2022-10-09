## ESLint

1. Check CHANGELOG
    - [eslint](https://github.com/eslint/eslint/blob/master/CHANGELOG.md).
    - [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint/blob/master/CHANGELOG.md).
2. Update packages

```sh
$  yarn add --dev -W  \
        @types/eslint@latest                     \
        @typescript-eslint/eslint-plugin@latest  \
        @typescript-eslint/parser@latest         \
        eslint-config-preact@latest              \
        eslint-config-prettier@latest            \
        eslint-gitignore@latest                  \
        eslint-import-resolver-typescript@latest \
        eslint-plugin-array-func@latest          \
        eslint-plugin-functional@latest          \
        eslint-plugin-import@latest              \
        eslint-plugin-jest@latest                \
        eslint-plugin-promise@latest             \
        eslint-plugin-react-hooks@latest         \
        eslint-plugin-react@latest               \
        eslint-plugin-security@latest            \
        eslint-plugin-total-functions@latest     \
        eslint-plugin-unicorn@latest             \
        eslint@latest
```

## Formatter

1.  check [CHANGELOG](https://github.com/prettier/prettier/blob/main/CHANGELOG.md)
2.  Update packages

```sh
$  yarn add --dev -W  \
        sort-package-json@latest                 \
        prettier@latest                          \
        prettier-plugin-organize-imports@latest  \
        prettier-plugin-packagejson@latest
```

-   latest recommended configuration: https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
-   https://github.com/prettier/prettier/blob/554b15473dd4032a036d7db91a8f579e624c9822/docs/integrating-with-linters.md

## TypeScript

```sh
$  yarn add --dev -W     \
        typescript@latest  \
        ts-morph@latest    \
        ts-node@latest     \
        tslib@latest
```

## Testing

```sh
$  yarn add --dev -W     \
        eslint-plugin-jest@latest     \
        cypress@latest                \
        jest@latest                   \
        jest-environment-jsdom@latest \
        jest-fetch-mock@latest        \
        ts-jest@latest
```

```sh
$  yarn add -W  \
        @testing-library/jest-dom@latest    \
        @testing-library/react@latest       \
        @testing-library/user-event@latest
```

## Bundler

```sh
$  yarn add --dev -W  \
        @types/compression-webpack-plugin@latest  \
        @types/copy-webpack-plugin@latest         \
        @types/dotenv-webpack@latest              \
        @types/react-hot-loader@latest            \
        @types/terser-webpack-plugin@latest       \
        @types/webpack-bundle-analyzer@latest     \
        @types/webpack-dev-server@latest          \
        @types/webpack-node-externals@latest      \
        compression-webpack-plugin@latest         \
        copy-webpack-plugin@latest                \
        css-loader@latest                         \
        dotenv-webpack@latest                     \
        dotenv@latest                             \
        html-webpack-plugin@latest                \
        raw-loader@latest                         \
        react-hot-loader@latest                   \
        source-map-loader@latest                  \
        style-loader@latest                       \
        url-loader@latest                         \
        webpack-bundle-analyzer@latest            \
        webpack-cli@latest                        \
        webpack-dev-server@latest                 \
        webpack-merge@latest                      \
        webpack-node-externals@latest             \
        webpack@latest
```

## Node

```sh
$  yarn add --dev -W  \
        @types/argparse@latest    \
        @types/node@latest        \
        argparse@latest  \
        command-line-args@latest  \
        cpx@latest                \
        cross-env@latest          \
        glob@latest               \
        http-server@latest        \
        npm-run-all@latest        \
        rimraf@latest             \
        wireit@latest             \
        wsrun@latest
```
