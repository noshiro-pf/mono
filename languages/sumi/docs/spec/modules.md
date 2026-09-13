<!-- cspell:ignore resi -->

# モジュール、import/export、モジュール解決

## 目標

- グローバル名前空間の共有ではなく、**明示的な import 文**による依存の宣言。
- JS/TS のモジュール解決が歴史的経緯で抱えた選択肢の多さ(CJS/ESM、拡張子省略、`index` 暗黙解決、`baseUrl`、`paths`、`moduleResolution` の各種モード…)を排し、**解決規則をただ一つに固定**する。

## 許可する import 形(確定 2026-09-05 — D-27 / D-28)

```ts
import { foo, bar } from './relative/path.mjs'; // 名前付き import
import { type Foo, baz } from 'package-name'; // inline type 指定(値と混在する文のみ)
import type { Foo } from 'package-name'; // 型だけの文は必ずこの形(D-59)
import type * as NsType from 'package-name'; // 型だけの名前空間 import(D-59)
import * as ns from 'package-name'; // 名前空間 import(使用はプロパティアクセスのみ — D-28)
import { qux } from '#internal/qux.mjs'; // `#` subpath import(package.json の `imports` 経由 — D-28)
const lazy = await import('./lazy.mjs'); // dynamic import(制限なし — D-28)
```

- **束縛が全部型である import 文は `import type` で書く(確定 2026-09-13 — D-59)。** 値と型が混在する文は inline 形(`import { bar, type Foo }`)でよい。これは好みの問題ではなく、拘束 compilerOption の `verbatimModuleSyntax`(常時 true — [compiler-options.md](./compiler-options.md))の帰結である:

    ```ts
    import { type Foo } from './dep.mjs'; // → import {} from './dep.mjs';  ← 副作用 import が残る
    import type { Foo } from './dep.mjs'; // → 完全に消える
    import { bar, type Foo } from './dep.mjs'; // → import { bar } from './dep.mjs';  ← 問題なし
    import * as Ns from './dep.mjs'; // 型にしか使わなくても → import * as Ns from './dep.mjs';
    import type * as Ns from './dep.mjs'; // → 完全に消える
    ```

    `verbatimModuleSyntax` は「書いたとおりに出す」ので、inline の型指定子だけを消して**空の import 文を残す**(TypeScript 7.0.2 / 6.0.3 で実測)。その残骸は上表で禁止している**副作用 import そのもの**であり、したがって記法の選択は副作用 import の禁止から一意に決まる。**Sumi lint の段階から強制する。**

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
| `import '...'`(副作用 import)                                  | 副作用のためだけのモジュール実行は暗黙のグローバル状態変更。**例外なし**(確定 2026-09-13 — D-59)。代替は「CLI から実行する」か「関数として import して呼ぶ」  |
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

`sumi/no-mixed-star-export`(@sumi-lang/oxlint-config の JS plugin、2026-09-08 実装): `ExportAllDeclaration`(`exported` を持たない `export * from` / `export type * from`)を含むファイルに他の文があれば、その文ごとに報告する構文ルール。`export * as ns from` は名前 `ns` の明示 export なので「他の文」側。型情報は要らない。名前が実際に衝突しているかは見ない — それは tsc の TS2308 が担当する。この monorepo の `pnpm run gen:index` が生成する index.mts は `export *` のみなので既に適合する。

## 副作用 import の代替(確定 2026-09-13 — D-59)

禁止そのものは D-27 で確定済みで、`import/no-unassigned-import` を `allow: []` で有効化して実装されている。残っていたのは「代替手段が本当にあるのか」で、リポジトリ内の実例 33 件で確かめた結果、**答えは用途で割れる**:

| 実例                      | 件数 | 代替                                                                    |
| :------------------------ | ---: | :---------------------------------------------------------------------- |
| `import 'dotenv/config';` |   20 | **ある** — `import { config } from 'dotenv'; config();`(関数として呼ぶ) |
| `import './index.css';`   |   13 | **無い** — 下記                                                         |

**CSS(および画像等のアセット)の import はモジュールの実行ではなく、バンドラへの指示である。** 関数形は存在しないので「関数として import して呼ぶ」は当てはまらない。かつ Sumi のモジュール解決(拡張子必須・パッケージは `exports` 経由)は `.css` を解決しないので、**Sumi 下のアプリは CSS をモジュールグラフに載せられない**。したがって例外規定を設けるのではなく、**CSS は `index.html` の `<link>` かバンドラ設定側に出す**のが Sumi での書き方になる。

これは規則ではなく**移行の作法**なので、Sumi sugar / refined の利用者向けドキュメントに書く必要がある([../implementation-plan.md](../implementation-plan.md) の「将来の作業」に TODO)。現在 `sumi check` の対象は synstate 3 パッケージだけで apps を含まないため、この衝突はまだ表面化していない。

## Sumi sugar / refined でのライブラリ配布(未決 — 2026-09-13、ユーザー提起 — issue [#1753](https://github.com/noshiro-pf/mono/issues/1753) のコメント)

`.d.mts` 相当の宣言ファイルが要るのか、declaration merging を支えるのか、そもそも npm でどう配るのか。まだ決めていないが、判断材料は揃っている。

### 判定条件: 宣言ファイルが要るのは「型体系が TS から離れたとき」だけ

- **Sumi lint の型は TS の型そのもの**(大原則 1)。**Sumi sugar の出力も TS**(大原則 3、D-1)。したがって sugar までの層では、公開するライブラリは**生成した TS / JS と `.d.mts`** をそのまま出せばよく、**TS の利用者にも Sumi の利用者にも普通の TS パッケージに見える**。新しい成果物も、registry 側の問題も発生しない。
- **Sumi refined は型検査を変える**(ネイティブ `Int` 等 — TS に対応物が無い)。そこで初めて `.d.mts` が表現できない型が出るので、**`.d.sumi` 相当が要るとすればこの層**である。つまり「宣言ファイルが要るか」は層ごとに答えが違い、**sugar では不要、refined では要る**が今のところの筋。

### 宣言ファイルの本当の用途は「Sumi でないものを記述すること」

リポジトリ内の実例を数えると(2026-09-13):

| 用途                               | 例                                              | Sumi での扱い                                           |
| :--------------------------------- | :---------------------------------------------- | :------------------------------------------------------ |
| 型の無い JS ライブラリに型を付ける | `html2canvas.d.mts`                             | **残る需要**                                            |
| JS でないアセットに型を付ける      | `css.d.mts` ×2                                  | D-59 でアセットはモジュールグラフを離れるので**消える** |
| ビルド時に注入される値             | `build-id.d.mts`                                | **残る需要**                                            |
| prelude の global 型               | ts-type-forge の `global.mts`(`declare global`) | prelude の例外規定として既に想定済み                    |

`declare module` は 19 箇所、`declare global` は 5 箇所。**残る需要はいずれも「Sumi で書かれていないものを記述する」**ためであって、Sumi のコードを記述するためではない。そちらは `.d.mts` が今日そのまま使える。

### declaration merging

`interface` 自体は公開型として残す方針([classes.md](./classes.md))。merging の用途は (a) global 拡張 — `declare global` は既に禁止(prelude のみ例外)、(b) サードパーティの型の module augmentation — 上の表の「型の無い JS」と同じ枠。したがって **merging を言語機能として支えるかどうかは、(b) をどう扱うかとほぼ同じ問い**になる。`.d.sumi` の中でだけ許す、という案(ユーザー提起)はこの枠に素直に収まる。

### ReScript の参考(調査 2026-09-13、要追確認)

- **ReScript には `.d.ts` に相当する別形式が無い。** 公開パッケージには `.res` ソースがそのまま入り、依存側は `rescript.json` の `bs-dependencies` / `dependencies` に書く。コンパイラは依存を **`node_modules` の中から**見つける必要があり(パスと package 名の両方を検証する)、ローカルパス参照は拒否される。**ソースが宣言を兼ねる**形。
- 公式マニュアルの推奨は「コンパイル済み JS も公開せよ」で、**JS 利用者は ReScript 製だと気づかずに使える**。`.resi`(モジュールごとの署名ファイル)は任意であって、別の成果物形式ではない。
- **Sumi との違い**: ReScript は出力 JS を「読む物」とは考えていないのでソース同梱が要る。Sumi sugar は**出力 TS が人間の保守に耐えること**を受け入れ条件にしている(大原則 3)ので、**出力そのものが配布物になれる** — ここが分岐点で、ReScript の方式をそのまま真似る必要は無い。
- npm registry 自体は任意のファイルを含む tarball を受け付けるので、`.sumi` ソースの同梱は可能。`package.json` の `types` は `.d.ts` を指す前提なので Sumi 独自の宣言を載せる先にはならず、必要になれば `exports` の条件(`"sumi"` 等)か独自フィールドになる。**ただし上記のとおり sugar までは必要にならない見込み。**

### 検討すること

- refined で `.d.sumi` を導入するとして、**sugar / lint の利用者からどう見えるか**(同じパッケージが両方の層から使われる)。
- 型の無い JS ライブラリへの型付けを Sumi の中でどう書くか(`.d.mts` をそのまま書くのか、Sumi 側の記法を用意するのか)。
- `exports` の条件を足す案を採る場合、D-28 が固定した「解決規則は一つだけ」との整合。

## 未解決の論点

- `import.meta.url` など `import.meta` の扱い。
