## Plugin の追加の仕方

1. `pnpm add eslint-plugin-X`
2. scripts/gen-eslint-rules/constants/eslint-plugins.mts に定義を追加
3. `pnpm run gen-rule-type`
4. src/configs/plugins.mts を更新
5. src/rules に rule ファイル追加
6. src/configs のどれかに rules を追加
