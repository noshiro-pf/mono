import { type WritingsInfo } from '../types';
import { default as zennArticles } from './zenn-articles.json';

export const zennArticleTitle = IMap.new(
  zennArticles.articles.map((a) => [a.slug, a.title] as const),
);

export const writings: readonly WritingsInfo[] = [
  {
    id: 'event-schedule-app',
    link: 'https://noshiro.notion.site/71b7d1ccf29945c0a1a086e1a030a91a',
    title: '★ 自作アプリ「イベント日程調整アプリ」の紹介',
    subtitle:
      'イベント日程調整アプリ（https://event-schedule-app.web.app/）の機能の紹介ページ',
    body: '',
  },
  {
    id: 'syncflow-slides',
    link: 'https://docs.google.com/presentation/d/1y9F5jxD6e1bFzLOs3BVAzIqhW806OfmLzIYaaU1j7yM/edit#slide=id.p',
    title: '★ リアクティブプログラミングライブラリ「SyncFlow」を自作した話',
    subtitle:
      '私がウェブフロントエンドの状態管理に使用している自作ライブラリの紹介',
    body: 'RxJSで発生するglitchという現象の発生原因とその対処法、他のglitch-freeリアクティブプログラミングライブラリがどう解決しているかを論文等を参照しつつ紹介。最後に拙作「SyncFlow」の実装概要を説明。',
  },
  {
    id: 'take-full-advantage-of-typescript-eslint',
    link: 'https://zenn.dev/noshiro_piko/articles/take-full-advantage-of-typescript-eslint',
    title: `★ ${zennArticleTitle.get('take-full-advantage-of-typescript-eslint') ?? 'ESLint を使い倒す（おすすめルール紹介）'}`,
    subtitle: '',
    body: 'eslint:recommended などの config には含まれないが有用な ESLint ルールなどを紹介しています。',
  },
  {
    id: 'reactive-programming-introduction-with-rxjs',
    link: 'https://qiita.com/pikohideaki/items/292ab134397f4959e66b',
    title: '★ リアクティブプログラミングはどう有用なのか',
    subtitle: 'リアクティブプログラミングについての入門者向け解説記事',
    body: 'リアクティブプログラミングとは何なのか・どうやって使うのか・使うと何が嬉しいのかを RxJS を題材になるべく予備知識なく分かるように解説してみたもの。',
  },
  {
    id: 'io-ts',
    link: 'https://docs.google.com/presentation/d/19YwEkeNl8x3IWglTv8YjcOZPyMVympXn0qyDLf2mXUI/edit#slide=id.p',
    title: 'io-ts のようなライブラリを自作した',
    subtitle: '自作ライブラリ "@noshiro/io-ts" の紹介スライド',
    body: 'TypeScript で型とバリデーター関数をより安全に効率良く実装するためのライブラリを作りました。',
  },
  {
    id: 'numeric-input-interface',
    link: 'https://zenn.dev/noshiro_piko/articles/numeric-input-interface',
    title: `★ ${zennArticleTitle.get('numeric-input-interface') ?? 'numeric input の React コンポーネントのインターフェース設計考察'}`,
    subtitle: '',
    body: 'ウェブUIにおける一般的な数値入力欄をReactコンポーネントとして定義する際のインターフェース・状態管理方法について考えまとめました。',
  },
  {
    id: 'typescript-type-branding',
    link: 'https://zenn.dev/noshiro_piko/articles/typescript-branded-type-int',
    title: `★ ${zennArticleTitle.get('typescript-branded-type-int') ?? 'TypeScript の Type Branding をより便利に活用する方法のまとめ'}`,
    subtitle: '',
    body: 'TypeScript で用いられることのある Type Branding というハックをより便利に活用する方法をまとめました。',
  },
  {
    id: 'typescript-type-utilities-min-max',
    link: 'https://zenn.dev/noshiro_piko/articles/typescript-type-utilities',
    title: `★ ${zennArticleTitle.get('typescript-type-utilities') ?? 'TypeScript 型ユーティリティ集'}`,
    subtitle: '',
    body: '私が自作してライブラリやアプリの開発などにも使っている TypeScript の型ユーティリティをまとめました。',
  },
  {
    id: 'typescript-type-utilities',
    link: 'https://zenn.dev/noshiro_piko/articles/typescript-type-level-min',
    title: `★ ${zennArticleTitle.get('typescript-type-level-min') ?? 'TypeScript の型ユーティリティ Min, Max の実装'}`,
    subtitle: 'TypeScript の型ユーティリティ Min, Max の実装と解説',
    body: '',
  },
  {
    id: 'type-challenges-introduction',
    link: 'https://docs.google.com/presentation/d/1uyL1tUJkpL8kgoNwpSy28sjCMHNzsYiO1aPC4_yzTYs/edit?usp=sharing',
    title: '★ type challenges の紹介',
    subtitle: '',
    body: 'TypeScriptの型パズル集から、個人的に役に立った知識が多く詰まった問題を1問選んで解説してみました。',
  },
  {
    id: 'typescript-void-type',
    link: 'https://zenn.dev/noshiro_piko/articles/typescript-void-type',
    title:
      zennArticleTitle.get('typescript-void-type') ??
      'TypeScript で関数の戻り値型を undefined とすべきか void とすべきか',
    subtitle: '',
    body: '',
  },
  {
    id: 'notes-on-type-guard-functions',
    link: 'https://zenn.dev/noshiro_piko/articles/notes-on-type-guard-functions',
    title:
      zennArticleTitle.get('notes-on-type-guard-functions') ??
      'TypeScriptの型ガード関数を定義する際に避けるべきパターン覚書',
    subtitle: '',
    body: '',
  },
  {
    id: 'javascript-to-number',
    link: 'https://zenn.dev/noshiro_piko/articles/javascript-to-number',
    title:
      zennArticleTitle.get('javascript-to-number') ??
      'JavaScript で文字列を数値に変換する方法まとめ（加筆予定）',
    subtitle: '',
    body: '',
  },
  {
    id: 'tatekae',
    link: 'https://docs.google.com/presentation/d/1YlzL2HnN73eB13s8t0EMAoqbLMCMb3Zrb6QJ_vTUCSk/edit#slide=id.p',
    title: '最短手数の立替精算方法を計算するアルゴリズム',
    subtitle:
      '旅先で立て替えた支払いの最適な精算方法を計算する効率の良いアルゴリズムについて',
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
    link: 'https://noshiro.notion.site/TypeScript-v4-1-noUncheckedIndexedAccess-00144ca0b4f44c1cb73f7ca43002aa70?pvs=4',
    title:
      'TypeScript v4.1 で追加されたnoUncheckedIndexedAccessオプションを有効にして使いこなす方法',
    subtitle: '',
    body: 'TSの新コンパイラオプションnoUncheckedIndexedAccessを使う際に便利なユーティリティの紹介です。',
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
    body: 'RxJSのようなリアクティブプログラミングができるライブラリの簡易版を実装し、誰でも基本的な動作を理解できるようにするために書いたもの。',
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
] as const;
