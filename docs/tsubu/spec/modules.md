# モジュール、import/export、モジュール解決

## 目標

- グローバル名前空間の共有ではなく、**明示的な import 文**による依存の宣言。
- JS/TS のモジュール解決が歴史的経緯で抱えた選択肢の多さ(CJS/ESM、拡張子省略、`index` 暗黙解決、`baseUrl`、`paths`、`moduleResolution` の各種モード…)を排し、**解決規則をただ一つに固定**する。

## 許可する import 形(確定 2026-09-05 — D-27 / D-28)

```ts
import { foo, bar } from './relative/path.mjs'; // 名前付き import
import { type Foo, baz } from 'package-name'; // inline type 指定
import type { Foo } from 'package-name'; // 型のみ import
import * as ns from 'package-name'; // 名前空間 import(使用はプロパティアクセスのみ — D-28)
import { qux } from '#internal/qux.mjs'; // `#` subpath import(package.json の `imports` 経由 — D-28)
const lazy = await import('./lazy.mjs'); // dynamic import(制限なし — D-28)
```

- 相対 import は必ず拡張子付き(`.mjs`)。
- パッケージ import はパッケージ名(+ `exports` で公開された subpath)のみ。
- `#` subpath imports は package.json の `imports` フィールド経由で解決する(`exports` と同じ仕組み — D-28)。
- `import * as ns` は許可するが、`ns` の使用はプロパティアクセス(`ns.foo`)に限る。`ns` オブジェクトを値として持ち回る等の非 tree-shakable な使用は禁止(D-28、`tree-shakable/import-star`)。
- dynamic `import()` は無制限で許可する(D-28)。

## 禁止する形(確定 2026-09-05 — D-27 / D-28)

| 構文                                                           | 理由                                                                                                                                                          |
| :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `import foo from '...'`(default)                               | default export の禁止と対。名前の同一性が失われる(import 側が自由に命名できてしまう)                                                                          |
| `export default ...` / `export { x as default }`               | 同上。named export のみ。**設定ファイルも含め全面禁止**(D-28)。default export を要求するツールへの接続は下記「default export を要求するツールとの接続」(D-36) |
| `import * as ns` の非 tree-shakable な使用                     | import 自体は許可(上表)。`ns` を値として渡す・spread する等、プロパティアクセス以外の使用を禁止(D-28)                                                         |
| `import '...'`(副作用 import)                                  | 副作用のためだけのモジュール実行は暗黙のグローバル状態変更                                                                                                    |
| `require` の代替としての dynamic `import()` の禁止は**しない** | dynamic `import()` は無制限で許可(D-28)。この行は旧「未定」の記録                                                                                             |
| `require` / `import foo = require(..)`                         | CJS は存在しない(erasableSyntaxOnly にも含まれる)                                                                                                             |
| `declare global` / script モード                               | ユーザーコードはグローバルを定義できない。すべてのファイルはモジュール(prelude だけが例外)                                                                    |
| triple-slash reference                                         | 歴史的遺物                                                                                                                                                    |
| `export =`                                                     | CJS 遺物                                                                                                                                                      |

## モジュール解決(確定 2026-09-05 — D-27 / D-28)

解決規則は一つだけ:

1. `./` / `../` で始まる specifier → 記載どおりのファイル(拡張子必須、`index` 暗黙解決なし)。
2. それ以外 → パッケージ名として `node_modules` の `exports` フィールド経由で解決。`exports` を持たないパッケージへの依存は違法(境界の問題として扱う → 未解決の論点)。
3. `#` で始まる specifier → package.json の `imports` フィールド経由で解決(D-28)。`exports` と同じく package.json が定める規則であり、解決規則の種類を増やさない。
4. `tsconfig` の `baseUrl` / `paths` は使用しない(`#` imports がその受け皿になる)。

tsc 上の対応は `module: nodenext` + `moduleResolution: nodenext` に固定([compiler-options.md](./compiler-options.md))。

## 強制手段

- v1: ESLint(`no-restricted-syntax` + import 系ルール)+ tsconfig 固定。この monorepo の既存規約(「`.mts` を `.mjs` 拡張子で import」「named export のみ」)がそのまま土台になる。

## default export を要求するツールとの接続(確定 2026-09-05 — D-36)

ESLint flat config / Vite / Vitest / Rollup 等は設定ファイルの default export を要求するが、ソースの export 形は named 一択を崩さない。

- **v2**: transpiler が `export default` を **emit** する(default export は出力側にだけ現れる)。指示は transpiler の設定ファイル(パスパターン → default にする named export 名)が第一候補、ファイル内ディレクティブが次点(D-36)。具体形は v2 設計時に決める。パス指定で構文の許可範囲を変える一般機構は採らない(D-36 却下案)。
- **v1(暫定)**: 設定の本体は Tsubu の通常モジュールとして named export で書き(`export const eslintConfig = …`)、ツールが読むファイルは検査対象外の 1 行アダプタにする:

```ts
// eslint.config.mts — Tsubu の検査対象外(ロジックを持たない)
export { eslintConfig as default } from './configs/eslint.config.mjs';
```

## TS へ戻るときの影響

なし。許可される形はすべて標準的な TS/ESM であり、むしろ最も互換性の高い書き方に限定している。

## 未解決の論点

- **barrel ファイル(`export * from ...`)を許すか(保留 2026-09-05 — D-28)。** この monorepo の `pnpm run gi` は `export *` で index.mts を生成している。`export *` 同士の名前衝突は tsc が TS2308 で報告するが、同じ barrel の**明示 export(`export const foo` / `export { foo } from`)が同名の `export *` を無警告で隠す**(2026-09-05 実測)。生成 index は `export *` のみで構成され明示 export と混ざらないのでこの問題は起きない。「生成物のみ許可」「混在のみ禁止」「全面禁止」を検討したが決定は見送り。
- `import.meta.url` など `import.meta` の扱い。
