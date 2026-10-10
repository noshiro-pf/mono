# `/netmeme` 実装計画

<!-- cspell:ignore netmeme amae napi librsvg Noto -->

漫画のコマを切り抜いた画像（ネットミーム）を事前に登録しておき、
`/netmeme <name>` でその画像を返す。名前ごとに定義したプレースホルダーに
引数を渡すと、吹き出しの文字列を差し替えた画像を生成して返す。

## 1. 現状の整理

- コマンドは Discord のアプリケーションコマンド（スラッシュコマンド）ではなく、
  `messageCreate` で本文の先頭を `startsWith` で見ているだけの**テキストコマンド**
  （`src/discord/send-poll-message.mts` の `sendMessageMain`）。
  `/netmeme` もこの方式に合わせる。
- コマンド名は `src/constants.mts` の `triggerCommand` に集約され、開発環境では
  `-dev` が付く。プレゼンス（`discord.mts`）にも列挙されている。
- 引数は `"..."` で囲む流儀（`rpParseCommand`）。
- ビルドは esbuild でファイル単位に `src/` → `build/` へ変換するだけで、
  `src/assets/` のような非 TS ファイルはコピーされない（既存の 2 画像も未参照）。
- このパッケージにはテストの仕組み（vitest）がまだない。

## 2. 仕様

### コマンド

```txt
/netmeme <name>                     … デフォルトの文字列のまま画像を返す
/netmeme <name> "文字列1" "文字列2"   … プレースホルダーを前から順に差し替える
/netmeme                            … 登録済みミームの一覧（名前・説明・プレースホルダー）
/netmeme help <name>                … そのミームのプレースホルダーとデフォルト値
```

開発環境では `/netmeme-dev`。

- 引数は登録時に定義したプレースホルダーの順に対応する。省略した後ろの
  プレースホルダーはデフォルト値。空文字 `""` は「空にする」ではなく
  デフォルト値扱いにするかは要決定（→ 7. 未決事項）。
- `"..."` 内の改行は吹き出し内の改行として扱う（`rp` と違い空白に潰さない）。
- 名前は登録名と別名（aliases）で引ける。英字は大文字小文字を区別しない。
- 返信は元メッセージへの `reply`、`allowedMentions: { parse: [], repliedUser: false }`。

### エラー時の挙動

既存コマンドは解析失敗を黙って無視しているが、`/netmeme` は利用者が文字数などで
失敗しやすいので、理由を短く返信する。

| 状況                           | 返信                                           |
| :----------------------------- | :--------------------------------------------- |
| 未登録の名前                   | 「`xxx` は登録されていません」＋近い名前の候補 |
| 引数がプレースホルダーより多い | 期待する個数と `help` の案内                   |
| 文字数上限超過                 | どのプレースホルダーが何文字までか             |
| 最小フォントでも収まらない     | 「文字が多すぎて吹き出しに収まりません」       |
| 描画・送信の失敗               | 返信せず `console.error`（既存と同じ）         |

## 3. 登録データ（テンプレート）

### 画像の置き場所

漫画のコマは著作物で、このリポジトリは公開されている。**画像はリポジトリに
コミットしない。** Bot を動かす VM 上のディレクトリを環境変数
`NETMEME_DIR` で指し、そこに manifest・画像・フォントを置く。

```txt
$NETMEME_DIR/
  manifest.json
  images/
    amae.png        … 吹き出しの元の文字を白で消した版
  fonts/
    <manga-font>.otf
```

リポジトリには、自作の単純な図形で作ったテスト用テンプレート
（`test/fixtures/netmeme/`）だけを置く。

吹き出しは**元の文字を消した画像を登録し、デフォルトの文字列も Bot が描く**。
元画像の上に白い矩形で塗りつぶす方式は、吹き出しの形によって縁が欠けるため採らない。
これで「差し替えなし」と「差し替えあり」が同じ描画経路になり、見た目が揃う。

### manifest の形

ts-fortress でスキーマを定義し、起動時に検証する。

```ts
type NetmemeManifest = Readonly<{
    fonts: readonly Readonly<{ family: string; file: string }>[];
    templates: readonly NetmemeTemplate[];
}>;

type NetmemeTemplate = Readonly<{
    name: string; // 'amae'
    aliases: readonly string[]; // ['甘え']
    description: string;
    image: string; // 'images/amae.png'
    placeholders: readonly Readonly<{
        key: string; // 'target'
        default: string; // 'うつ病'
        maxLength: number; // 書記素数（Intl.Segmenter で数える）
    }>[];
    bubbles: readonly Readonly<{
        text: string; // '{target}は甘え' — 1 つの吹き出しに複数・同じ key を複数の吹き出しに書いてもよい
        box: Readonly<{ x: number; y: number; width: number; height: number }>; // 吹き出しの内接矩形
        direction: 'vertical' | 'horizontal';
        fontFamily: string;
        fontSize: Readonly<{ max: number; min: number }>;
        lineHeight: number; // フォントサイズに対する倍率
        color: string; // 既定 '#000'
        stroke?: Readonly<{ color: string; width: number }>; // コマ外の手書き風文字向け
    }>[];
}>;
```

起動時の検証（スキーマに書けないもの）:

- `bubbles[].text` 中の `{key}` がすべて `placeholders` に宣言されている
- 宣言した `placeholders` がどこかの吹き出しで使われている
- `name` と `aliases` が全テンプレートを通して重複しない
- `image` / `fonts[].file` が存在し、`box` が画像の範囲内にある
- デフォルト値で描画して吹き出しに収まる

**検証に失敗しても Bot は落とさない。** `/netmeme` だけを無効にしてエラーを
ログに出し、投票機能は動き続ける。壊れたテンプレート 1 つだけを除外するか、
manifest 全体を無効にするかは 7. で決める（推奨: 1 つだけ除外）。

## 4. 描画

### ライブラリ

**`@napi-rs/canvas` を推奨**。

- フォントファイルを `GlobalFonts.registerFromPath` で直接登録でき、
  VM の fontconfig やインストール済みフォントに依存しない。
- 1 文字ずつ座標を決めて描けるので縦書きを自前で組める。
- ビルド済みバイナリをプラットフォーム別の optionalDependencies で配るため
  install script が不要（`allowBuilds` に足さずに済むはず。導入時に確認）。

`sharp`（lockfile に既にある）＋ SVG テキストも候補だが、文字描画は librsvg 任せで
縦書き・約物の位置・フォント指定の制御が効かないので採らない。

### 縦書きレイアウト

漫画の吹き出しはほぼ縦書きなので、ここが実装の本体になる。
レイアウトは**描画から切り離した純粋関数**にし、文字幅の計測関数を注入して
テストする。

```ts
const layoutBubble = (
  text: string,
  bubble: Bubble,
  measure: (text: string, fontSize: number) => number,
): Result<Readonly<{ fontSize: number; glyphs: readonly Glyph[] }>, 'overflow'>;

type Glyph = Readonly<{ text: string; x: number; y: number; rotate: 0 | 90 }>;
```

- 書記素単位で分割する（`Intl.Segmenter`）。絵文字や結合文字を壊さない。
- 列は右から左。`box.height` を超えたら次の列へ折り返す。明示的な改行も次の列。
- 全体を `box` の中央に寄せる（列の束を水平中央、各列は上揃え）。
- フォントサイズは `max` から 1px ずつ下げ、収まった最大を採る。`min` でも
  収まらなければ `overflow`。
- 約物の扱い:
    - `、。` などは縦書き用の字形に置き換える（`U+FE10`–`U+FE19`、
      `U+FE30`–`U+FE4F` の縦書き形。`「」『』（）【】…‥` もここで賄える）。
      Canvas は OpenType の `vert` を適用しないため、置換表で対応する。
    - 縦書き形がない `ー〜～－` と半角英数字は 90° 回転させる。
    - 小書きの仮名（`ぁっゃ` など）は右上に寄せる。
    - 行頭禁則（`、。」）ー` やっ・ゃ）は前の列の末尾へ追い出す（ぶら下げはしない）。
- 半角英数字の縦中横はやらない（必要になったら追加）。

横書きは折り返しと中央寄せだけの単純版を同じインターフェースで用意する。

### 描画処理

1. 起動時に manifest を読み、フォントを登録し、全画像を `loadImage` して
   メモリに保持する（ミームは数十枚程度の想定）。
2. 要求ごとに画像サイズの canvas を作り、元画像を描く。
3. 各吹き出しについて、プレースホルダーを展開した文字列を `layoutBubble` に渡し、
   得た glyph を `fillText`（必要なら先に `strokeText`）で描く。
4. PNG にエンコードして `AttachmentBuilder` で送る。

## 5. ファイル構成

```txt
apps/poll-discord-app/
  src/
    constants.mts                 … triggerCommand.netmeme を追加
    env.mts                       … NETMEME_DIR を追加
    main.mts                      … 起動時に loadNetmemeRegistry、結果を listener へ渡す
    discord/
      discord.mts                 … プレゼンスに追加、registry を受け取る
      send-poll-message.mts       … sendMessageMain から netmeme へ分岐
      send-netmeme-message.mts    … 新規: 解析 → 描画 → 返信
    netmeme/                      … 新規（index.mts は gen:index が生成）
      manifest-type.mts           … ts-fortress のスキーマ
      load-netmeme-registry.mts   … 読み込み・検証・画像とフォントの準備
      parse-netmeme-command.mts   … 一覧 / help / name + 引数
      expand-placeholders.mts     … 引数とデフォルトの束縛、{key} の展開、文字数検査
      vertical-forms.mts          … 縦書き形の置換表・回転対象・小書き・禁則の文字集合
      layout-bubble.mts           … 縦書き / 横書きレイアウト（純粋関数）
      render-netmeme.mts          … canvas への描画と PNG 化
  scripts/cmd/
    netmeme-preview.mts           … 登録作業用（下記）
  test/fixtures/netmeme/          … 自作のテスト用 manifest と画像
  configs/vitest.config.mts       … 新規
```

各 `*.mts` の横に `*.test.mts` を置く。

### 登録作業用スクリプト

座標を決める作業を楽にするため、`pnpm run netmeme:preview -- <name> [args...]`
で `$NETMEME_DIR` のテンプレートを描画してファイルに書き出す。`--debug` で
`box` の枠と列の区切りを赤線で重ねて描く。manifest 全体の検証だけを走らせる
`--check` も付ける（VM 上で manifest を編集した後に Bot を再起動する前の確認用）。

## 6. 実装の順序

TDD で、純粋関数から外側へ進める。

1. **テスト基盤**: vitest と `check:test` を追加（`apps/algo-app` に倣う）。
2. **コマンド解析**: `parse-netmeme-command`。一覧 / help / 名前のみ / 引数あり /
   改行を含む引数 / `-dev`。
3. **プレースホルダー**: `expand-placeholders`。省略時のデフォルト、引数過多、
   文字数上限（書記素で数える）、同じ key が複数箇所。
4. **manifest 検証**: スキーマ違反、未宣言 / 未使用の key、名前の重複、範囲外の box。
5. **レイアウト**: 等幅の偽 `measure` で座標を決定的に検証。折り返し、
   改行、中央寄せ、フォント縮小、overflow、縦書き形の置換、回転、小書き、禁則。
6. **描画**: `@napi-rs/canvas` を導入し、fixture を描いて PNG のサイズと
   「box の外の画素が元画像と一致する」ことを確かめる煙テスト。preview スクリプト。
7. **Discord 連携**: `triggerCommand`、プレゼンス、`sendMessageMain` の分岐、
   返信、エラー返信、`main.mts` での起動時読み込み。
8. **ドキュメント**: README の usage に `/netmeme` を追記、`dotenv-example` に
   `NETMEME_DIR`、manifest の書き方と preview スクリプトの使い方。
9. **本番の登録**: VM に `$NETMEME_DIR` を用意し、画像の文字消し → preview で
   座標調整 → `--check` → 再起動。

### 変更に伴って走らせるもの

- パッケージの `check:types`, `fix:lint`, `check:test`, `fix:codemod:diff`
- 依存追加に伴い `check:knip`, `check:published-deps`, `gen:deps-graph`
- `check:md`, `check:cspell`, `check:prose`, `pnpm run fmt`
- `@napi-rs/canvas` が `minimumReleaseAge` を満たす版であること

## 7. 未決事項

| #   | 論点                                   | 推奨                                   | 代案                                                                                         |
| :-- | :------------------------------------- | :------------------------------------- | :------------------------------------------------------------------------------------------- |
| 1   | 画像の置き場所                         | VM 上の `NETMEME_DIR`（リポジトリ外）  | Firebase Storage（既に firebase を使っている。複数 VM なら）                                 |
| 2   | 引数の渡し方                           | 位置引数 `"..." "..."`                 | 名前付き `target="..."` も併用                                                               |
| 3   | `""` の扱い                            | デフォルト値                           | 空の吹き出し                                                                                 |
| 4   | 壊れたテンプレート                     | そのテンプレートだけ除外して起動       | manifest 全体を無効                                                                          |
| 5   | テキストコマンドかスラッシュコマンドか | 既存に合わせてテキストコマンド         | アプリケーションコマンド（名前の補完が効くが、引数の数がミームごとに違うのでモーダルが要る） |
| 6   | フォント                               | OFL のアンチック体（漫画の写植に近い） | Noto Sans JP                                                                                 |
| 7   | 連投対策                               | ユーザーごとに数秒のクールダウン       | なし                                                                                         |
| 8   | 登録方法                               | VM のファイルを編集して再起動          | Discord から画像を添付して登録するコマンド（将来）                                           |

## 8. スコープ外

- Discord からのテンプレート登録・再読み込みコマンド
- 縦中横、ルビ、吹き出しごとのフォント自動選択
- GIF など静止画以外のミーム
