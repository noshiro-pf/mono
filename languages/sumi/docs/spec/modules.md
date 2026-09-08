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
2. それ以外 → パッケージ名として `node_modules` の `exports` フィールド経由で解決。`exports` を持たないパッケージへの依存も**合法**(`main` / `types` による nodenext の解決に従う — 確定 2026-09-06、D-42)。ただし **何も export しない script(副作用だけのモジュール)は import できない**: 副作用 import は禁止(上表)で、名前付き import は export が無ければ型エラーになるため、追加の規則は要らない。
3. `#` で始まる specifier → package.json の `imports` フィールド経由で解決(D-28)。`exports` と同じく package.json が定める規則であり、解決規則の種類を増やさない。
4. `tsconfig` の `baseUrl` / `paths` は使用しない(`#` imports がその受け皿になる)。

tsc 上の対応は `module: nodenext` + `moduleResolution: nodenext` に固定([compiler-options.md](./compiler-options.md))。

## 強制手段

- Sumi lint: oxlint preset(import 系 native ルール + sumi JS plugin の `no-internal-module-import` / `no-namespace-object-use` / `no-mixed-star-export` — D-43 / D-52)+ tsconfig 拘束(`sumi check`、D-46)。この monorepo の既存規約(「`.mts` を `.mjs` 拡張子で import」「named export のみ」)がそのまま土台になる。

## default export を要求するツールとの接続(確定 2026-09-05 — D-36)

ESLint flat config / Vite / Vitest / Rollup 等は設定ファイルの default export を要求するが、ソースの export 形は named 一択を崩さない。

- **Sumi sugar**: transpiler が `export default` を **emit** する(default export は出力側にだけ現れる)。指示は transpiler の設定ファイル(パスパターン → default にする named export 名)が第一候補、ファイル内ディレクティブが次点(D-36)。具体形は Sumi sugar 設計時に決める。パス指定で構文の許可範囲を変える一般機構は採らない(D-36 却下案)。
- **Sumi lint(暫定)**: 設定の本体は Sumi の通常モジュールとして named export で書き(`export const eslintConfig = …`)、ツールが読むファイルは検査対象外の 1 行アダプタにする:

```ts
// eslint.config.mts — Sumi の検査対象外(ロジックを持たない)
export { eslintConfig as default } from './configs/eslint.config.mjs';
```

## TS へ戻るときの影響

なし。許可される形はすべて標準的な TS/ESM であり、むしろ最も互換性の高い書き方に限定している。

## 自分のディレクトリの index(確定 2026-09-09 — D-42 / D-53)

`./index.mjs`(**自分のディレクトリ**の index)は許可し、`../index.mjs` 以上の**遡り**を禁止する。禁止規則の趣旨は「index を参照するならディレクトリ名で呼べ(`./X/index.mjs`)」であり、自分のディレクトリは内側から名前で呼びようがないので、`./index.mjs` はこの要求を満たしようがない形である。一方 `../index.mjs` は呼べるディレクトリ名があるのに位置で指しているので禁止のままとする。

`./index.mjs` を無条件に許してよいのは、**危険な場合が循環と一致する**ため。自分がその index に含まれていれば `index → 自分 → index` の循環になり、循環 import 禁止(`import-x/no-cycle`)が捕まえる。含まれていなければ循環ではなく、それがパッケージ入口(`entry-point.mts` は生成 index の対象外)の形そのものである。したがって index 規則の側で入口を特別扱いする必要はない。

以前はファイル名 `entry-point.mts` に対する override で例外にしていたが、**言語がファイル名をマジックワードにするのは避ける**(`index.{mts,ts}` のように TS 自身が特別視する名前とは違い、`entry-point.mts` はこのリポジトリの慣習にすぎない)。

- **強制手段の穴(2026-09-09)**: oxlint に `no-cycle` 相当のルールが無い(`oxlint --rules` に存在しない)。したがって `sumi check` の現行実装では、自分自身を含む index を `./index.mjs` で読む循環は検出されない。ESLint 側(`import-x/no-cycle`)には有るので、専用チェッカーか oxlint の実装待ち。enforcement-map に記録。

## barrel ファイル(確定 2026-09-08 — D-52)

`export * from '...'` を 1 つでも含むファイル(barrel)は、**`export * from` / `export type * from` だけで構成する**。ローカル宣言、`export { foo } from`、`export * as ns from`、`import`、実行文は置けない。`export *` 同士を並べること、ディレクトリごとに `index.mts` を再帰的に置くことは従来どおり許す。

### 何を防ぐか — 明示 export による暗黙の shadowing

ES の export 解決では、ローカル宣言と `export { } from` の**明示 export が星 export より優先**され、同名があっても診断は出ない。tsc も同じ挙動で(tsgo 7.0.2 で実測)、次のコードは型エラーにならない。

```ts
// a.mts
export const foo = 'from a';
export const onlyA = 1;

// c.mts
export const foo = 'from c';

// index.mts — 混在 barrel(禁止)
export * from './a.mjs';
export { foo } from './c.mjs'; // a.mts の foo をここで無警告で隠す

// use.mts
import { foo, onlyA } from './index.mjs';
const check: 'from c' = foo; // 通る: barrel 経由では a.mts の foo は存在しない
```

問題になるのは変更の経路である。`c.mts` の `foo` を明示 re-export している barrel に対して、後から誰かが `a.mts` にも `foo` を追加すると(逆に、`a.mts` の `foo` が先にあって後から `export { foo } from './c.mjs'` が足された場合も同じ)、barrel 経由の利用者は**全員が黙って `c` の実装を掴んだまま**になる。`a.mts` を直接 import している側との間で同じ名前が別物を指す状態が、どこにも診断が出ないまま成立する。ローカル宣言(`export const foo = ...` を barrel 内に直接書く形)でも同じことが起きる。

対して、星 export 同士の衝突は必ず診断になる。

```ts
// index.mts — export * のみ(許可)
export * from './a.mjs';
export * from './c.mjs'; // TS2308: Module './a.mjs' has already exported a member named 'foo'.
```

実行時も一致していて、曖昧な名前は星 export から除外され、名前指定で import した時点で `SyntaxError: The requested module './index.mjs' contains conflicting star exports for name 'foo'` になる。つまり barrel を星 export だけにしておけば、名前の衝突は型検査でも実行時でも必ず表面化し、黙って別の実装に差し替わる経路がなくなる。

### 書き換え方

混在していた barrel は、インラインの部分を別ファイルへ出してそれを `export *` すれば同じ公開面になる。

```ts
// 変更前 — index.mts
export * from './a.mjs';
export const helper = (x: number): number => x + 1;

// 変更後 — helper.mts
export const helper = (x: number): number => x + 1;

// 変更後 — index.mts
export * from './a.mjs';
export * from './helper.mjs';
```

名前付きの厳選 re-export(`export { foo, bar } from './impl.mjs'` だけを並べる入口)は `export *` を含まないので対象外であり、そのままでよい。両方を混ぜたい場合だけ、上のように分ける。

### 強制手段

`sumi/no-mixed-star-export`(@sumi-lang/oxlint-config の JS plugin、2026-09-08 実装): `ExportAllDeclaration`(`exported` を持たない `export * from` / `export type * from`)を含むファイルに他の文があれば、その文ごとに報告する構文ルール。`export * as ns from` は名前 `ns` の明示 export なので「他の文」側。型情報は要らない。名前が実際に衝突しているかは見ない — それは tsc の TS2308 が担当する。この monorepo の `pnpm run gi` が生成する index.mts は `export *` のみなので既に適合する。

## 未解決の論点

- `import.meta.url` など `import.meta` の扱い。
