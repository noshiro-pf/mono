# モジュール、import/export、モジュール解決

## 目標

- グローバル名前空間の共有ではなく、**明示的な import 文**による依存の宣言。
- JS/TS のモジュール解決が歴史的経緯で抱えた選択肢の多さ(CJS/ESM、拡張子省略、`index` 暗黙解決、`baseUrl`、`paths`、`moduleResolution` の各種モード…)を排し、**解決規則をただ一つに固定**する。

## 許可する import 形(提案)

```ts
import { foo, bar } from './relative/path.mjs'; // 名前付き import
import { type Foo, baz } from 'package-name'; // inline type 指定
import type { Foo } from 'package-name'; // 型のみ import
```

- 相対 import は必ず拡張子付き(`.mjs`)。
- パッケージ import はパッケージ名(+ `exports` で公開された subpath)のみ。

## 禁止する形(提案)

| 構文                                   | 理由                                                                                       |
| :------------------------------------- | :----------------------------------------------------------------------------------------- |
| `import foo from '...'`(default)       | default export の禁止と対。名前の同一性が失われる(import 側が自由に命名できてしまう)       |
| `export default ...`                   | 同上。named export のみ。フレームワークが要求する場合の例外規定は未定(→ 未解決の論点)      |
| `import * as ns from '...'`            | **未定**。名前空間オブジェクトとして有用(`Optional` 等)だが、tree-shaking との相性を検討   |
| `import '...'`(副作用 import)          | 副作用のためだけのモジュール実行は暗黙のグローバル状態変更                                 |
| dynamic `import()`                     | **未定**。code splitting に必要。v1 では禁止し、必要になった時点で制限付きで解禁を検討     |
| `require` / `import foo = require(..)` | CJS は存在しない(erasableSyntaxOnly にも含まれる)                                          |
| `declare global` / script モード       | ユーザーコードはグローバルを定義できない。すべてのファイルはモジュール(prelude だけが例外) |
| triple-slash reference                 | 歴史的遺物                                                                                 |
| `export =`                             | CJS 遺物                                                                                   |

## モジュール解決(提案)

解決規則は一つだけ:

1. `./` / `../` で始まる specifier → 記載どおりのファイル(拡張子必須、`index` 暗黙解決なし)。
2. それ以外 → パッケージ名として `node_modules` の `exports` フィールド経由で解決。`exports` を持たないパッケージへの依存は違法(境界の問題として扱う → 未解決の論点)。
3. `tsconfig` の `baseUrl` / `paths` は使用しない。`#` subpath imports は v1 では禁止(未定)。

tsc 上の対応は `module: nodenext` + `moduleResolution: nodenext` に固定([compiler-options.md](./compiler-options.md))。

## 強制手段

- v1: ESLint(`no-restricted-syntax` + import 系ルール)+ tsconfig 固定。この monorepo の既存規約(「`.mts` を `.mjs` 拡張子で import」「named export のみ」)がそのまま土台になる。

## TS へ戻るときの影響

なし。許可される形はすべて標準的な TS/ESM であり、むしろ最も互換性の高い書き方に限定している。

## 未解決の論点

- **barrel ファイル(`export * from ...`)を許すか。** この monorepo の `pnpm run gi` は `export *` で index.mts を生成している。`export *` は名前衝突を静かに解決するなどの問題もあるが、生成物に限れば管理されている。「手書きの `export *` は禁止、生成された per-directory entry point のみ許可」という規定が有力か。
- **default export しか受け付けないフレームワーク**(Next.js の page 等)との接続。境界ファイルの例外規定を設けるか、対象外と割り切るか。
- `import * as ns`、dynamic import、`#` imports(上表)。
- `import.meta.url` など `import.meta` の扱い。
