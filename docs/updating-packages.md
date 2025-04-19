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
        tslib@latest
```

## Testing

```sh
$  yarn add --dev -W     \
        eslint-plugin-jest@latest     \
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

## Node

```sh
$  yarn add --dev -W  \
        @types/argparse@latest    \
        @types/node@latest        \
        argparse@latest  \
        command-line-args@latest  \
        cross-env@latest          \
        glob@latest               \
        http-server@latest        \
        npm-run-all@latest        \
        rimraf@latest             \
        wireit@latest             \
        wsrun@latest
```
