import { type WritingsInfo } from '../types';

export const writings: readonly WritingsInfo[] = [
  {
    id: 'io-ts',
    link: 'https://docs.google.com/presentation/d/19YwEkeNl8x3IWglTv8YjcOZPyMVympXn0qyDLf2mXUI/edit#slide=id.p',
    title: 'io-ts のようなライブラリを 自作した',
    subtitle: '自作ライブラリ "@noshiro/io-ts" の紹介スライド',
    body: '',
  },
  {
    id: 'event-schedule-app',
    link: 'https://noshiro.notion.site/71b7d1ccf29945c0a1a086e1a030a91a',
    title: '★ 自作アプリ「イベント日程調整アプリ」の紹介',
    subtitle:
      'イベント日程調整アプリ（https://event-schedule-app.web.app/）の機能の紹介ページ',
    body: '',
  },
  {
    id: 'ReScript-TypeScript',
    link: 'https://noshiro.notion.site/ReScript-TypeScript-44f051af3fd94c9489058c6a77826049',
    title: 'ReScript で既存の TypeScript コード置き換えを試みた感想',
    subtitle: '',
    body: 'ReScriptを使ってみた感想をまとめました。',
  },
  {
    id: 'typescript-union-combination-limit-of-25',
    link: 'https://www.kabuku.co.jp/developers/typescript-union-combination-limit-of-25',
    title:
      'Union 型を含むオブジェクト型を代入するときに遭遇しうるTypeScript型チェックの制限について',
    subtitle: '',
    body: 'Union型を内部に含むタプルやレコード型の代入可能性判定で遭遇しうる型チェックの制限について、TypeScriptのコンパイラのソースコードを読んで調べたので紹介します。',
  },
  {
    id: 'type-challenges-introduction',
    link: 'https://docs.google.com/presentation/d/1uyL1tUJkpL8kgoNwpSy28sjCMHNzsYiO1aPC4_yzTYs/edit?usp=sharing',
    title: '★ type challenges の紹介',
    subtitle: '',
    body: 'TypeScriptの型パズル集から、個人的に役に立った知識が多く詰まった問題を1問選んで解説してみました。',
  },
  {
    id: 'ts4.1-immutable-setin',
    link: 'https://www.kabuku.co.jp/developers/typescript-strictly-typed-immutable-library',
    title:
      '★ TypeScript v4.3 の機能を使って immutable ライブラリの型付けを頑張る',
    subtitle:
      'immutable.js や immer の課題を解決するための自作TypeScriptライブラリ紹介',
    body: 'TypeScript v4.3 の新機能と型レベルプログラミングを駆使して、ウェブフロントエンド開発において頻繁に行う immutable なオブジェクトの状態更新を行うための安全なライブラリの作り方を紹介します。',
  },
  {
    id: 'about-noUncheckedIndexedAccess',
    link: 'https://www.notion.so/noshiro/TypeScript-v4-1-noUncheckedIndexedAccess-00144ca0b4f44c1cb73f7ca43002aa70',
    title:
      'TypeScript v4.1 で追加されたnoUncheckedIndexedAccessオプションを有効にして使いこなす方法',
    subtitle: '',
    body: 'TSの新コンパイラオプションnoUncheckedIndexedAccessを使う際に便利なユーティリティの紹介です。',
  },
  {
    id: 'syncflow-slides',
    link: 'https://docs.google.com/presentation/d/1y9F5jxD6e1bFzLOs3BVAzIqhW806OfmLzIYaaU1j7yM/edit#slide=id.p',
    title: '★ リアクティブプログラミングライブラリ「SyncFlow」を自作した話',
    subtitle:
      'RxJSで発生するglitchという不健全な挙動と、拙作「SyncFlow」の紹介',
    body: 'RxJSで発生するglitchという現象の発生原因とその対処法、他のglitch-freeリアクティブプログラミングライブラリがどう解決しているかを論文等を参照しつつ紹介。最後に拙作「SyncFlow」の実装概要を説明。',
  },
  {
    id: 'color-contrast-qiita',
    link: 'https://qiita.com/pikohideaki/items/59415524503f833ce41e',
    title: '★ 見分けやすいN色をうまく選ぶ関数を作ったよ',
    subtitle:
      'コントラスト比を考慮した見分けやすいN色を選ぶアルゴリズムについての記事',
    body: '',
  },
  {
    id: 'how-to-create-reactive-programming-library',
    link: 'https://qiita.com/pikohideaki/items/57dab6c6e8d0687a8806',
    title: '簡易リアクティブプログラミングライブラリの作り方（TypeScript）',
    subtitle:
      'TypeScriptで簡単なリアクティブプログラミングライブラリっぽいものをスクラッチで実装する',
    body: 'RxJSのようなリアクティブプログラミングができるライブラリの簡易版を実装し、敷居を下げるために書いたもの。',
  },
  {
    id: 'reactive-programming-introduction-with-rxjs',
    link: 'https://qiita.com/pikohideaki/items/292ab134397f4959e66b',
    title: '★ RxJSによるリアクティブプログラミング入門',
    subtitle:
      'RxJSを用いたリアクティブプログラミングについての入門者向け解説記事',
    body: 'リアクティブプログラミングとは何なのか・どうやって使うのか・使うと何が嬉しいのかをなるべく予備知識なく分かるように解説してみたもの。',
  },
  {
    id: 'dezero-slides',
    link: 'https://slides-dezero-06-to-16.web.app/',
    title: 'ゼロから作るディープラーニング3 step06-16',
    subtitle: 'ゼロから作るディープラーニング3の社内輪読会で使用した資料',
    body: 'reveal.jsを用いて作成．',
  },
  {
    id: 'slides-chain-rule',
    link: 'https://slides-chain-rule.web.app/',
    title: '連鎖律のやや厳密な証明',
    subtitle: '社内輪読会資料',
    body: 'reveal.jsを用いて作成．',
  },
];
