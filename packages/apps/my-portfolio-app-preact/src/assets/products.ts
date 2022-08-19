import type { ProductsInfo } from '../types';
import {
  AnnotationToolAppImage,
  CantStopProbabilityAppImage,
  CatanDiceAppImage,
  ColorDemoAppImage,
  DominionOnlineAppImage,
  EventScheduleAppImage,
  HousingLoanCalculatorAppImage,
  LambdaInterpreterAppImage,
  MnistAppImage,
  MyPortfolioAppImage,
} from './images';

export const products: DeepReadonly<{
  libraries: ProductsInfo[];
  webApps: ProductsInfo[];
}> = {
  libraries: [
    {
      id: 'syncflow',
      link: 'https://github.com/noshiro-pf/mono/tree/main/packages/utils/syncflow',
      title: '★ SyncFlow',
      subtitle: 'リアクティブプログラミング用のTypeScriptのライブラリ',
      description:
        'RxJS風の構文のリアクティブプログラミングライブラリ。前作の「rnjs」と同じく「グリッチ」が起きないRxJSを目指し作ったものだが、rnjs で発生したパフォーマンスの問題を解決するために内部実装を全面的に刷新。priority queueを使わず、topological sortによりObservable全体のDAGの依存関係を事前に計算して更新を実行することでglitchを回避するようにし、都度queueを挟む実装より高速に実行できるようにした。',
      implementation: 'TypeScriptで実装。（最終更新：2022年8月19日）',
      imageUrl: '',
    },
    {
      id: 'io-ts',
      link: 'https://github.com/noshiro-pf/mono/tree/main/packages/utils/io-ts',
      title: '@noshiro/io-ts',
      subtitle:
        '外界から来た値の型チェックをより便利に行うためのTypeScriptライブラリ',
      description:
        '説明ページ → https://docs.google.com/presentation/d/19YwEkeNl8x3IWglTv8YjcOZPyMVympXn0qyDLf2mXUI/edit#slide=id.p',
      implementation: 'TypeScriptで実装。（最終更新：2022年8月19日）',
      imageUrl: '',
    },
    {
      id: 'ts-type-utils',
      link: 'https://github.com/noshiro-pf/mono/tree/main/packages/utils/ts-type-utils',
      title: '@noshiro/ts-type-utils',
      subtitle: 'TypeScriptの型ユーティリティ集',
      description: '`UintRange<1, 5> = 1 | 2 | 3 | 4 | 5` などの型を提供',
      implementation: 'TypeScriptで実装。（最終更新：2022年8月17日）',
      imageUrl: '',
    },
    {
      id: 'ts-utils',
      link: 'https://github.com/noshiro-pf/mono/tree/main/packages/utils/ts-utils',
      title: '@noshiro/ts-utils',
      subtitle: 'TypeScriptのユーティリティ集',
      description: 'Result型などの頻繁に使用するユーティリティを提供',
      implementation: 'TypeScriptで実装。（最終更新：2022年8月7日）',
      imageUrl: '',
    },
    {
      id: 'tiny-router-observable',
      link: 'https://github.com/noshiro-pf/mono/tree/main/packages/utils/tiny-router-observable',
      title: '@noshiro/tiny-router-observable',
      subtitle: '簡易的なRouterライブラリ',
      description: 'React Router より簡単なAPIのライブラリが欲しかったので自作',
      implementation: 'TypeScriptで実装。（最終更新：2022年4月1日）',
      imageUrl: '',
    },
    {
      id: 'rnjs',
      link: 'https://github.com/noshiro-pf/mono/tree/main/experimental/rnjs',
      title: 'rnjs',
      subtitle: 'リアクティブプログラミング用のTypeScriptのライブラリ',
      description:
        'RxJS風の構文のリアクティブプログラミングライブラリ。RxJSで発生しうる「グリッチ」という現象が起きないようにしたもの（Observableの発火をpriority queueで管理している）。',
      implementation:
        'TypeScriptで実装。npmで"rnjs"という名前で公開。（制作日：2019年1月）',
      imageUrl: '',
    },
  ],
  webApps: [
    {
      id: 'event-schedule-app',
      link: 'https://event-schedule-app.web.app/',
      title: '★ イベント日程調整ツール',
      subtitle: 'イベントのスケジュール調整用アプリケーション',
      description:
        '説明ページ → https://www.notion.so/noshiro/c40d53907f204a3e9961a4a2b623ca22',
      implementation: `React・TypeScript・Immutable.js・RxJSで実装。CSSライブラリに Blueprint.js を使用。バックエンドはFirebase FirestoreとFunctions（制作日：2020年1月05日、最終更新：2021年9月22日）
        → 2021-03-10にRxJSを自作ライブラリ SyncFlow に差し替えた。Immutable.js も自作ライブラリに差し替えた。`,
      imageUrl: EventScheduleAppImage,
    },
    {
      id: 'annotation-tool',
      link: 'https://annotation-tool-d8b49.web.app/',
      title: 'アノテーションツール（未完成）',
      subtitle: '矩形ツールによる画像アノテーションを行うUI',
      description:
        'Pixi.jsでぬるぬる動かしてみたくて作ったおもちゃ。もし需要があったら入出力とかできるように整えるかも。',
      implementation:
        'React・TypeScript・Pixi.jsで実装。CSSライブラリに Blueprint.js を使用。（最終更新：2020年9月28日）',
      imageUrl: AnnotationToolAppImage,
    },
    {
      id: 'housing-loan-calculator',
      link: 'https://housing-loan-calculator.web.app',
      title: '住宅ローン返済シミュレータ',
      subtitle: '住宅ローンの月々の返済額などを計算',
      description:
        '表計算ソフトで作りかけてなんとなくBlueprint.jsを試したくなったので作った。クエリパラメータでスナップショットを保存可能。',
      implementation:
        'React・TypeScriptで実装。CSSライブラリに Blueprint.js を使用。（制作日：2019年11月17日、最終更新：2021年9月22日）',
      imageUrl: HousingLoanCalculatorAppImage,
    },
    {
      id: 'cant-stop-probability',
      link: 'https://cant-stop-probability.web.app/',
      title: "ボードゲーム「Can't Stop」の確率表",
      subtitle: '',
      description:
        '表計算ソフトで式を書くのは骨が折れると思ったので作成。完全に自分用。',
      implementation:
        'React・TypeScriptで実装。CSSライブラリに Blueprint.js を使用。（制作日：2021年1月22日）',
      imageUrl: CantStopProbabilityAppImage,
    },
    {
      id: 'color-demo-app',
      link: 'https://color-demo-app.web.app',
      title: 'Color Contrast Demo',
      subtitle:
        '色のコントラストなどについて書いた記事（https://qiita.com/pikohideaki/items/59415524503f833ce41e）のために作ったデモアプリ。',
      description: '',
      implementation:
        'React・TypeScriptで実装。CSSライブラリに material-UI を使用。（制作日：2019年12月07日、最終更新：2020年1月27日）',
      imageUrl: ColorDemoAppImage,
    },
    {
      id: 'catan-dice',
      link: 'https://catan-dice-5f3bc.web.app/',
      title: 'CATAN dice',
      subtitle:
        '6面ダイス2個を振って合計を表示するカタン（ボードゲーム）用サポートアプリ',
      description:
        '実物のダイスを振るのが面倒なのとより良い乱数で遊びたかったので作った。同じ目が出ても振ったかどうか分かるようなエフェクトを付けている。ダイスを転がすアニメーション等があってもよいかもしれない。',
      implementation: [
        'React・RxJS・TypeScriptで実装。RxJSはリングの透明度変化を扱うために使用した（連打時に前のアニメーションをキャンセルする処理）。',
        '（制作時期：2019年7月）',
        '→ 2021-03-12にRxJSを自作ライブラリ SyncFlow に差し替えた。',
      ].join(''),
      imageUrl: CatanDiceAppImage,
    },
    {
      id: 'my-portfolio-app',
      link: 'https://my-portfolio-app-4f8be.web.app/',
      title: 'ポートフォリオ',
      subtitle: 'このページ',
      description: '',
      implementation: [
        'React・TypeScript・Material UIで実装。',
        '静的ページだが、Markdownでモバイル端末でも簡単に編集できるように、 Dropbox上に置いたMarkdown形式テキストを fetchし"ReactMarkdown"により表示するようにした',
        '（→ 後にmarkdownファイルも直接bundleするように変更）。',
        'タブ切り替えをreact-routerで行うように変更（2020/08/04）。（最終更新：右上に記載）',
        ' → 2021-09-22 に Preact 化した。ルーティングも自作ライブラリに置き換えた。',
        'Github Actions で main branch 更新時に自動でデプロイするよう設定。',
      ].join(''),
      imageUrl: MyPortfolioAppImage,
    },
    {
      id: 'lambda-calculus-interpreter',
      link: 'https://lambda-calculus-interpre-70e41.web.app',
      title: 'Lambda Calculus Interpreter',
      subtitle: '簡単な型無しラムダ計算のインタプリタ（おもちゃ）',
      description:
        "使えるアルファベットは [a-z]。一部のマクロ（'+', 'PLUS', 'SUCC', 数字）に対応。括弧の省略は未対応。もうちょっと高機能にしたい。",
      implementation: [
        'Angular・RxJS・TypeScriptで実装。（制作時期：2017年12月）',
        ' → 2019年8月7日にReactで再実装 → 2021/1/27にPreactやSolidにも移植',
        ' → 2021-03-12にRxJSを自作ライブラリ SyncFlow に差し替えた。',
      ].join(''),
      imageUrl: LambdaInterpreterAppImage,
    },
    {
      id: 'mnist-app',
      link: 'https://tools-8af31.firebaseapp.com/#/toybox/mnist',
      title: 'MNIST App',
      subtitle: '手書き数字認識のデモアプリケーション',
      description:
        '勉強用に手を動かしたくて作ったおもちゃ。Chromeのみ動作確認済み。「ゼロから作るDeep Learning」第7章のCNN。（開発停止中）',
      implementation:
        'Angular・RxJS・TypeScriptで実装。推論器(CNN)はTypeScriptでスクラッチで実装（教科書ではPythonで実装していたのでnumpyの一部の関数もTypeScriptに移植した）。テストデータでの精度は>98%だが、単純なモデルなので汚く書くと正解できないことも多い。パラメータはjson形式のテキストデータをダウンロードしているので初期読み込みが少し遅い。（制作時期：2018年9月）',
      imageUrl: MnistAppImage,
    },
    {
      id: 'dominion-app',
      link: 'https://dominionapps.firebaseapp.com/#/online-game',
      title: '★「ドミニオン」オンライン対戦（要ログイン）',
      subtitle: 'カードゲーム「ドミニオン」のオンライン対戦アプリ',
      description:
        'ブラウザで2～4人の対戦に対応。LINE風のチャット機能付き。ゲーム結果は集計表で確認できる。基本セットを中心に実装が簡単なカードのみ実装した。ToDo: パフォーマンスチューニング、拡張セットの実装。（開発停止中）',
      implementation:
        'Angular・RxJS・TypeScriptで実装。バックエンドはFirebase Realtime DB。（制作時期（旧バージョン含む）：2016年12月～2018年3月）',
      imageUrl: DominionOnlineAppImage,
    },
  ],
};
