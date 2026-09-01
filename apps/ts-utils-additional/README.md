# ts-utils-additional

`experimental/packages/utils/ts-utils-additional` からの部分復元。
`ts-data-forge` に後継が無いユーティリティのうち、**現在利用者がいるものだけ**
を入れてある。

## 入っているもの

| ディレクトリ   | 内容                                                         | 利用者                                |
| :------------- | :----------------------------------------------------------- | :------------------------------------ |
| `color/`       | Hsl / Rgb 型、相互変換、コントラスト比、`hslToStr` など      | `color-demo-app` ・ `annotation-tool` |
| `shape/`       | `Rect` ・ `Point` ・ `RectSize` の操作（正規化、内接、変換） | `annotation-tool` ・ `algo-app`       |
| `types/record` | `Point` ・ `Rect` ・ `RectSize` の型                         | 同上                                  |
| `array/math`   | `variance`                                                   | `color-demo-app`                      |
| `num/`         | `dist`（`color/` のテストヘルパが使う）                      | 内部のみ                              |

## 入れていないもの

移植元にはあるが、復元済みのパッケージから使われていないので持ち込んでいない。
必要になった時点で、それを必要とするパッケージの PR で足すのがよい。

| 省いたもの                                                 | 必要になる相手                        |
| :--------------------------------------------------------- | :------------------------------------ |
| `random/`（`getShuffled` ・ `permutation`）                | `algo-app`                            |
| `types/` の type-challenges 系（`PermutationString` ほか） | `algo-app`                            |
| `bit-array/` ・ `date/` ・ `functional/` ・ `image/`       | なし                                  |
| `others/` ・ `promise/` ・ `promise-result/` ・ `string/`  | なし（多くは `ts-data-forge` にある） |

`array/` は `math/variance` と `getShuffled` だけ。`zipArrays` などは `Tpl` や
旧 `pipe().chain()` に依存していて、利用者が現れた時に移行するのが自然。

`src/color/functions/hsl-to-rgb.old.mts.md`（旧実装を Markdown に退避した
49 行のファイル）も持ち込んでいない。現行の `hsl-to-rgb.mts` があるので、
残しても読み手を迷わせるだけになる。
