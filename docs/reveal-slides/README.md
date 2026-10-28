# reveal.js のスライド

[reveal.js](https://revealjs.com/) で書いた発表スライド。GitHub Pages の
`https://noshiro-pf.github.io/mono/slides/<deck>/` で公開している
（`tools/scripts/cmd/build-pages-site.mts` がこのディレクトリをそのまま
`slides/` に写す）。同じ `slides/` には `docs/marp-slides/` の Marp の
スライドも、名前から `-slides` を除いたディレクトリで並ぶ。

| deck                                     | 内容                                       |
| :--------------------------------------- | :----------------------------------------- |
| [`chain-rule/`](./chain-rule/)           | 連鎖律のやや厳密な証明（2020-07-28）       |
| [`dezero-06-to-16/`](./dezero-06-to-16/) | ゼロから作るディープラーニング 3 step06–16 |

## 構成

- `<deck>/index.html` が `<deck>/slide.md` を reveal.js の markdown プラグインで
  読み込み、`<deck>/images/` の画像を参照する。スライドの区切りは `---`、縦の
  区切りは `:::`。
- reveal.js と MathJax はバージョンを固定して CDN から読む（`main.js` と各
  `index.html`）。発表済みのスライドで内容を動かさないので、npm の依存にも
  ビルドにもしていない。
- 手元で見るときは `pnpm dlx serve docs/reveal-slides` のように静的サーバーで
  開く。`index.html` は `slide.md` を `fetch` するので、ファイルを直接開いても
  表示されない。

## Firebase Hosting からの移行

もとは Firebase Hosting の `slides-chain-rule.web.app` と
`slides-dezero-06-to-16.web.app` で公開していた。移行期間のあいだは各 deck の
`firebase.json` が旧 URL から Pages の同じパスへの redirect だけを持ち、その
deck のディレクトリで `pnpm dlx firebase-tools@15 deploy --only hosting` で
デプロイする。project を削除するときは、同じ変更で `firebase.json` と
`.firebaserc` を消す（`pnpm run check:root:firebase-redirects` が中身と対を
確かめる）。

`experimental/packages/slides/` から移した（#2576）。
