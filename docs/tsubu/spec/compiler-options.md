# compilerOptions の固定

## 目標

TS では同じ字面のコードでも tsconfig 次第で意味と安全性が変わる。この「設定の自由度」自体を負の遺産と見なし、**compilerOptions を言語仕様の一部として一意に固定**する。ユーザーが書く tsconfig は存在しない(v2 ではツールチェーンが内蔵する。v1 では「この構成以外での型検査結果は言語の検査結果ではない」と定義する)。

## 固定する構成(確定 2026-09-05 — D-27)

型チェック関連の値は mono の `tools/configs/tsconfig/tsconfig.type-check.json` の現行値を採用する(確定 2026-08-27)。

```jsonc
{
    "compilerOptions": {
        // ---- 型チェック: mono の tsconfig.type-check.json の値を採用 ----
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

        // ---- サブセット制約 ----
        "erasableSyntaxOnly": true, // D-4
        "verbatimModuleSyntax": true, // import/export の字面 = 出力。type import の明示を強制
        "isolatedModules": true,

        // ---- モジュール解決: 一意化 ----
        "module": "nodenext",
        "moduleResolution": "nodenext",
        "moduleDetection": "force", // script モードの排除

        // ---- 出力・その他 ----
        "target": "esnext",
        "useDefineForClassFields": true,
        "forceConsistentCasingInFileNames": true,
        "skipLibCheck": true, // 外部 .d.ts は言語の管轄外(strict-lib が組み込み層を担う)

        // ---- 標準ライブラリ ----
        "lib": ["esnext"], // + strict-ts-lib による差し替え(libReplacement)
        "libReplacement": true,
    },
}
```

## 補足

- **`strict` の中身は固定点ではない**(TS のバージョンで増える)。言語仕様としては「その時点の TS バージョンにおける全 strict フラグ有効」と定義し、TS のバージョン自体も言語バージョンに紐付ける。対応表は書かず、**preset / チェッカーの `peerDependencies` が対応する TS の範囲の単一の真実**(D-34)。
- **`exactOptionalPropertyTypes` を有効化しない**ことは、「プロパティ不存在」と「`undefined` が入っている」を型レベルで区別しない、という言語仕様上の選択でもある。「値がない」表現を `undefined` に一本化する方針([null-undefined.md](./null-undefined.md))の下では、この 2 状態の区別を増やさないことはむしろ一貫している(`Object.keys` 等で観測すれば実行時には区別が残る点は注意)。
- `erasableSyntaxOnly` / `verbatimModuleSyntax` は mono の現行値(false)より厳しい設定を採る(D-4 と [modules.md](./modules.md) のサブセット制約であり、型チェックの厳密度の話ではないため mono 追従の対象外)。
- `allowJs` / `checkJs` は mono では true だが、この言語のプロジェクトには JS ファイルが存在しないため false とする(確定 2026-09-05 — D-27)。
- `skipLibCheck` は妥協ではなく境界の定義: 組み込み層の型は strict-ts-lib が置き換え、サードパーティの `.d.ts` の内部整合性はこの言語の検査対象外。

## TS へ戻るときの影響

なし。この構成の tsconfig をそのままプロジェクトに置けば、同じ検査が tsc 単体で再現される。

## 未解決の論点

- `lib` に `dom` を含めるか(環境別プロファイル: `node` / `browser` / 共通、のような言語レベルのターゲット定義)。
- strict-ts-lib の branded(`libs-branded`)と plain(`libs`)のどちらを言語標準にするか。branded 側は number の安全化([README.md](../README.md) の TODO「numeric 型の安全化」)と直結する。
- TS バージョン更新の追従ポリシー。
