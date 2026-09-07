# compilerOptions の固定

## 目標

TS では同じ字面のコードでも tsconfig 次第で意味と安全性が変わる。この「設定の自由度」自体を負の遺産と見なし、**言語の意味と安全性に関わる compilerOptions を言語仕様として拘束**する(D-7、D-40 で改訂)。ユーザーが決めてよいのは実行環境と出力に関する項目だけで、拘束項目を上書きした構成での型検査結果は言語の検査結果ではない。

## 拘束する項目と自由な項目(確定 2026-09-06 — D-40、draft config)

型チェック関連の値は mono の `tools/configs/tsconfig/tsconfig.type-check.json` の現行値を採用する(確定 2026-08-27)。以下が Sumi lint preset の配布する base tsconfig の draft。**`// 拘束`** の項目はユーザーが変更できない(チェッカーが実効値を検証する)。それ以外の項目は自由。

```jsonc
{
    "compilerOptions": {
        // ---- 型チェックの厳密度(拘束) ----
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "exactOptionalPropertyTypes": false, // 有効化しない(確定)
        "noImplicitReturns": true,
        "noImplicitOverride": true,
        "noFallthroughCasesInSwitch": true,
        "noPropertyAccessFromIndexSignature": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "allowUnusedLabels": false, // (ラベル自体禁止だが多層防御)
        "allowUnreachableCode": false,

        // ---- サブセット制約(拘束) ----
        "erasableSyntaxOnly": true, // D-4
        "verbatimModuleSyntax": true, // import/export の字面 = 出力。type import の明示を強制
        "isolatedModules": true,
        "allowImportingTsExtensions": false, // 相対 import は `.mjs`(modules.md)
        "rewriteRelativeImportExtensions": false,
        "experimentalDecorators": false, // デコレータ禁止(banned-syntax.md)
        "emitDecoratorMetadata": false,
        "allowJs": false, // JS ファイルは存在しない(D-27)
        "checkJs": false,

        // ---- モジュール解決: 一意化(拘束) ----
        "module": "nodenext",
        "moduleResolution": "nodenext",
        "moduleDetection": "force", // script モードの排除
        // "baseUrl" / "paths" は指定不可(modules.md — `#` imports が受け皿)

        // ---- 標準ライブラリ(拘束) ----
        "libReplacement": true, // strict-ts-lib plain 版への差し替え(D-39)
        "skipLibCheck": true, // 外部 .d.ts は言語の管轄外(strict-ts-lib が組み込み層を担う)
        "forceConsistentCasingInFileNames": true,
        "useDefineForClassFields": true, // class は禁止だが emit の一貫性のため固定
        "jsx": "react-jsx", // JSX は automatic runtime のみ(jsx.md)

        // ---- 実行環境(自由) ----
        "lib": ["esnext"], // 環境に応じて "dom" 等を追加してよい。差し替えは libReplacement が全 lib に効く
        "types": [],
        "target": "esnext",
        "jsxImportSource": "react", // preact 等に変えてよい
        "customConditions": [],
        "resolveJsonModule": true,

        // ---- 出力・プロジェクト構成(自由) ----
        "noEmit": true, // outDir / declaration / sourceMap / composite / incremental 等も自由
    },
}
```

- **拘束の基準**: その項目の値によって「同じ字面のコードが言語として合法か」「型検査の結果」「モジュール解決の結果」が変わるものは拘束する。実行環境(どの組み込み API が存在するか)、emit の形、プロジェクトのファイル構成は言語の意味に関わらないので自由。
- **`lib`** が自由項目なので、「`dom` を含めるか」という環境別プロファイルを言語側で定義する必要はない。どの `lib` を選んでも strict-ts-lib の差し替えが効く(`@typescript/lib-dom` 等も strict-ts-lib が提供する)。
- **`noUnusedLocals` / `noUnusedParameters`** は lint とも重なるが、tsc 側でも拘束しておく(ESLint を外しても崩れない最小限の防御)。

## 補足

- **強制手段(実装済み 2026-09-08、D-46)**: `sumi-cli/tsconfig` が上の draft を base tsconfig として配布し、プロジェクトは `extends` する。`sumi check` は native tsc の `--showConfig` で実効 compilerOptions を取って拘束項目(`languages/sumi/cli/src/locked-compiler-options.mts` が単一の真実。この表とはテストで同期)と比較し、違反があれば型検査・lint を走らせずに止まる。不在の boolean は `false`(TS の既定)として受け入れ、`allowUnusedLabels` / `allowUnreachableCode` だけは明示必須(不在は「suggestion」の意味)、`strict` 系サブフラグの個別 `false` は `strict` の違反、enum 値は大文字小文字を無視する。
- **`strict` の中身は固定点ではない**(TS のバージョンで増える)。言語仕様としては「その時点の TS バージョンにおける全 strict フラグ有効」と定義し、TS のバージョン自体も言語バージョンに紐付ける。対応表は書かず、**preset / チェッカーの `peerDependencies` が対応する TS の範囲の単一の真実**(D-34)。
- **`exactOptionalPropertyTypes` を有効化しない**ことは、「プロパティ不存在」と「`undefined` が入っている」を型レベルで区別しない、という言語仕様上の選択でもある。「値がない」表現を `undefined` に一本化する方針([null-undefined.md](./null-undefined.md))の下では、この 2 状態の区別を増やさないことはむしろ一貫している(`Object.keys` 等で観測すれば実行時には区別が残る点は注意)。
- `erasableSyntaxOnly` / `verbatimModuleSyntax` は mono の現行値(false)より厳しい設定を採る(D-4 と [modules.md](./modules.md) のサブセット制約であり、型チェックの厳密度の話ではないため mono 追従の対象外)。
- `allowJs` / `checkJs` は mono では true だが、この言語のプロジェクトには JS ファイルが存在しないため false とする(確定 2026-09-05 — D-27)。
- `skipLibCheck` は妥協ではなく境界の定義: 組み込み層の型は strict-ts-lib が置き換え、サードパーティの `.d.ts` の内部整合性はこの言語の検査対象外。

## TS へ戻るときの影響

なし。拘束項目を含む base tsconfig をそのままプロジェクトに置けば、同じ検査が tsc 単体で再現される。

## 決定済みの論点(2026-09-06)

- ~~`lib` に `dom` を含めるか~~ → `lib` は自由項目(D-40)。環境別プロファイルは言語側で定義しない。
- ~~strict-ts-lib の branded と plain のどちらを言語標準にするか~~ → **plain(`libs/`、native number)版**(D-39)。branded 版は第 3 層(ネイティブ `Int`)の設計材料として残す。
- ~~TS バージョン更新の追従ポリシー~~ → preset / チェッカーの `peerDependencies` が単一の真実(D-34)。
