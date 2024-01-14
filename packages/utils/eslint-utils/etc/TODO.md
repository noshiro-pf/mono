# TODO

-   ESLint の型定義を改善（ `any` を使わない、 readonly array を使う、など）
-   schema から自動生成した型定義をドキュメントを元に精緻化
-   schema へ逆変換した結果を使い各 plugin に PR
    -   jest/valid-title
        -   https://github.com/jest-community/eslint-plugin-jest/blob/v26.1.1/src/rules/valid-title.ts#L143
    -   no-restricted-imports
        -   [no-restricted-imports](https://eslint.org/docs/rules/no-restricted-imports#options)
        -   [@typescript-eslint/no-restricted-imports](https://typescript-eslint.io/rules/no-restricted-imports/#options)
        -   https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-restricted-imports.ts#L29
    -   imports/extensions
        -   https://github.com/import-js/eslint-plugin-import/blob/v2.25.4/docs/rules/extensions.md
