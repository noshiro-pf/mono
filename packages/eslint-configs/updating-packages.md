## ESLint

1. Check CHANGELOG
    - [eslint](https://github.com/eslint/eslint/blob/master/CHANGELOG.md).
    - [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint/blob/master/CHANGELOG.md).
2. Update packages

```sh
$   yarn add  \
    @types/eslint@latest                        \
    @typescript-eslint/eslint-plugin@latest     \
    @typescript-eslint/parser@latest            \
    @typescript-eslint/utils@latest             \
    eslint@latest                               \
    eslint-import-resolver-typescript@latest    \
    eslint-plugin-array-func@latest             \
    eslint-plugin-cypress@latest                \
    eslint-plugin-deprecation@latest            \
    eslint-plugin-functional@latest             \
    eslint-plugin-import@latest                 \
    eslint-plugin-jest@latest                   \
    eslint-plugin-jsx-a11y@latest               \
    eslint-plugin-prefer-arrow-functions@latest \
    eslint-plugin-promise@latest                \
    eslint-plugin-react@latest                  \
    eslint-plugin-react-hooks@latest            \
    eslint-plugin-react-refresh@latest          \
    eslint-plugin-security@latest               \
    eslint-plugin-strict-dependencies@latest    \
    eslint-plugin-testing-library@latest        \
    eslint-plugin-total-functions@latest        \
    eslint-plugin-unicorn@latest                \
    eslint-plugin-vitest@latest                 \
    globals@latest                              \
    typescript-eslint@latest
```

then

```sh
$  yarn gen-rules-type
```
