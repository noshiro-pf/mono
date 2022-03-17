## ESLint

1. Check [CHANGELOG](https://github.com/eslint/eslint/blob/master/CHANGELOG.md).
2. Update packages

```bash
$  yarn add --dev -W  \
      @types/eslint@latest  \
      eslint@latest  \
      eslint-config-preact@latest  \
      eslint-gitignore@latest  \
      eslint-plugin-import@latest  \
      eslint-plugin-react@latest  \
      eslint-plugin-react-hooks@latest  \
      eslint-plugin-jest@latest  \
      eslint-plugin-array-func@latest  \
      eslint-import-resolver-typescript@latest  \
      eslint-plugin-promise@latest  \
      eslint-plugin-total-functions@latest
```

## typescript-eslint

1.  Check [CHANGELOG](https://github.com/typescript-eslint/typescript-eslint/blob/master/CHANGELOG.md).
2.  Update packages ([typescript-eslint Installation](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md))
    -   [eslint-plugin-functional](https://github.com/jonaskello/eslint-plugin-functional)

```bash
$  yarn add --dev -W  \
      @typescript-eslint/parser@latest  \
      @typescript-eslint/eslint-plugin@latest  \
      eslint-plugin-functional@latest
```

3.  Check rules diff https://github.com/typescript-eslint/typescript-eslint/compare/v4.7.0...v4.22.0?short_path=cc13116#diff-cc1311685cd745ae75aac85016dd9090f2193192130da4f84bfed0b9d0df00c8 and fix config

## Prettier

1.  check [CHANGELOG](https://github.com/prettier/prettier/blob/main/CHANGELOG.md)
2.  Update packages

```bash
$  yarn add --dev -W  \
      eslint-config-prettier@latest  \
      prettier@latest  \
      prettier-plugin-organize-imports@latest  \
      prettier-plugin-packagejson@latest
```

-   latest recommended configuration: https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
-   https://github.com/prettier/prettier/blob/554b15473dd4032a036d7db91a8f579e624c9822/docs/integrating-with-linters.md
