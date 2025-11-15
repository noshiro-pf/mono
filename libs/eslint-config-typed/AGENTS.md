# Repository Guidelines

## Project Structure & Module Organization

The ESLint config source sits in `src/`, organized by responsibility: `configs/` for build and test presets, `plugins/` and `rules/` for exported rule collections, `types/` for shared TypeScript declarations, and `custom-rules/` for repository-only rules. Utility scripts live in `scripts/`, with CLI helpers under `scripts/cmd/`. Configuration inputs (Rollup, Vitest, tsconfig variants) are in `configs/`. Generated artifacts land in `dist/`—never edit that directory directly.

## Build, Test, and Development Commands

Run `pnpm run build` for the full pipeline: cleans `dist/`, type-checks, bundles, and regenerates indexes. Use `pnpm run test` for Vitest with type-checking; switch to `pnpm run testw` for watch mode or `pnpm run test:cov` for coverage plus `pnpm run test:cov:ui` to inspect reports. `pnpm run lint` (or `pnpm run lint:fix`) validates the flat config. Formatting goes through `pnpm run fmt`; `pnpm run fmt:full` touches the entire tree. For comprehensive pre-release validation, execute `pnpm run check-all`.

## Testing Guidelines

Vitest powers the suite with strict type-checking. Co-locate tests as `*.test.mts` alongside the code or under `test/**`. Guard new rules with scenario-driven tests and include regression cases replicating reported bugs. Run `pnpm run test` locally before pushing; capture coverage deltas with `pnpm run test:cov` when altering critical rule logic.

## Commit & Pull Request Guidelines

Commits use Conventional Commit prefixes (`feat`, `fix`, `chore`, `docs`, `refactor`, etc.); declare breaking changes with the standard footer. Pull requests should describe purpose, highlight notable updates, link issues, and attach screenshots for docs changes. Ensure `pnpm run lint`, `pnpm run test`, and `pnpm run build` succeed before requesting review.

## Security & Configuration Tips

Develop against Node.js 18 or later (CI runs Node 25). Use `pnpm install --frozen-lockfile` for deterministic installs and store local secrets in `.env`, mirroring `.env.example`. Never commit generated credentials or tokens. Review GitHub automation scripts under `scripts/` before modifying workflow-sensitive tasks.

## Coding Style & Naming Conventions

All sources are TypeScript ESM using the `.mts` extension; compiled output is `.mjs`. Modules favor named exports; defaults are reserved for `configs/**` and `scripts/**`. Imports omit extensions unless targeting `.mjs` or `.json`. Follow the repository’s Prettier setup with organize-imports and package.json plugins—avoid manual formatting. Indentation is two spaces for code (Markdown uses four).

コード変更後は `pnpm run fmt` を実行し、 `pnpm run tsc` と `pnpm run lint:fix` で type errors、lint errors が出ないことをチェックし、エラーがあれば修正まで行う。

- 型安全を最優先
    - 関数の戻り値は明示する
    - `any` や `never` による危険な型アサーションはなるべく避ける。
    - 型定義には `interface` ではなく `type` を使い、readonly なプロパティやパラメータを基本とする。 記法については lint 設定に従う。
    - 暗黙の型強制を避ける
        - if や while 等の条件文の条件部や論理演算子のオペランドに boolean 以外の型の値を使用しない（`@typescript-eslint/strict-boolean-expressions` ルールでチェックされる）。
        - number, string, boolean 以外の型の変数を template literal に埋め込むことを禁止する（`@typescript-eslint/restrict-template-expressions` ルールでチェックされる）。
    - 配列のソート時に比較関数を必ず書く。ただし、文字列要素の配列（`string[]`）の場合のみ省略してよい（`require-array-sort-compare` ルールでチェックされる）。
    - 部分的な `reduce` や除算といった例外を生みやすい操作は禁止
- 演算子の使用の制限
    - `+foo` （数値への型強制）や `"" + foo`（文字列への型強制）などを禁止（`no-implicit-coercion` ルールでチェックされる）。
    - `"1" + 2` のような異なる型同士の加算を禁止（`@typescript-eslint/restrict-plus-operands` ルールでチェックされる）。
    - 文字列同士の連結にも `+` を使わない（`prefer-template` ルールでチェックされる）。代わりに `${a}${b}` あるいは `[a, b].join("")`, `"".concat(a, b)` のようにする。また、例えば改行を挟む場合は `[a, b].join("\n")` のようにする。
- 不変データ指向
    - `let` は使用せず `const` を使う（`functional/no-let`）。
        - どうしても使用しなければならない場合は変数名に `mut_` prefix を付ける。
    - readonly 型を徹底。
        - 配列は必ず `T[]` ではなく `readonly T[]` と readonly array にする。
        - ネストが深く `Readonly<*>` を書く量が多い場合には `DeepReadonly<{ a: { b: { c: number[] }}}>` のように `DeepReadonly` 型ユーティリティを用いることも検討する。
    - `functional/immutable-data` でオブジェクトの直接変更を禁止し、引数や返値のミュータブル化を避ける。
    - クラス継承や enum といった可変/部分的構造は原則排除。
- モダン構文の強制
    - `var` や `new Array()`、`in` 演算子、`React.useImperativeHandle` など旧来構文は使用しない。
    - テンプレートリテラル、オブジェクトスプレッド、`Object.hasOwn` の利用を推奨
- モジュール・依存管理
    - 循環 import を避ける（`import-x/no-cycle`）。
    - import は type-import を明示しつつ `.mjs`/`.json` 以外は拡張子を付けない。
    - `./a/b` のような内部パス import はしない。 各ディレクトリに index.mts ファイルを配置し他ディレクトリで参照するものを export しておく。 `pnpm run gi` コマンドで index.mts ファイルを全ディレクトリに対して自動生成できる。
    - default export は使用しない。
    - ツリーシェイク可能な記述をする
    - `node:` プレフィックスの標準モジュールを利用する
- 非同期処理の堅牢化
    - Promise には必ず `await` か `.catch()` を付与し、ネストや多重解決を排除（`no-floating-promises` ルールでチェックされる）。
- React/JSX ルール
    - コンポーネントは arrow function + `.tsx` 拡張子で定義する。
    - props spread や inline 関数/オブジェクト化を避ける。
    - Hooks の依存配列と呼び出し順序を厳格に管理し、React Refresh/Perf ルールで不要な再レンダリングや不正なエクスポートを防ぐ。
    - JSX 内の条件分岐では `cond && <Something />` のように短絡評価は使わず、 `cond ? <Something /> : undefined` と三項演算子を用いて厳密に条件分岐を行う（ `react/jsx-no-leaked-render` でチェック）。
- アクセシビリティの徹底
    - すべてのインタラクティブ要素に役割とラベルを付与。`alt` や `aria-*` の整合性、フォーカスの移動可能性、tabindex の管理など JSX a11y ルールに準拠したマークアップを行う。
- テストコード規約
    - Vitest/Jest/Playwright/Cypress 用ルールで `test` 名や `describe` ネスト、`expect` の配置を統一。
    - 同期イベントへの await や `force`/`pause` の乱用を禁じ、スクリーン API とユーザ操作シミュレーションを推奨する。
- セキュリティと品質
    - `eval`，`Function`，動的 `require`，危険な正規表現は使用禁止。
    - `unicorn/*` でファイル命名、配列操作、最新 DOM/Node API の採用を強制し、`import-x/no-useless-path-segments` や `no-restricted-globals` で可読性とバグ低減を図る。

## Plugin の追加の仕方

1. `pnpm add eslint-plugin-X`
2. scripts/gen-eslint-rules/constants/eslint-plugins.mts に定義を追加
3. `pnpm run gen-rule-type`
4. src/configs/plugins.mts を更新
5. src/rules に rule ファイル追加
6. src/configs のどれかに rules を追加
