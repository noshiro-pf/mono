import { ProductsInfo } from '../types/products';
import CatanDiceImage from './images/catan_dice_app.png';
import ColorDemoImage from './images/color_demo_app.png';
import DominionOnlineImage from './images/dominion_online_app.png';
import ScheduleImage from './images/event_schedule_app1.png';
import EventScheduleApp2Image from './images/event_schedule_app2.png';
import HousingLoanCalculatorImage from './images/housing_loan_calculator_app.png';
import LambdaInterpreterAppImage from './images/lambda_interpreter_app.png';
import MnistAppImage from './images/mnist_app.png';

export const products: {
  libraries: ProductsInfo[];
  webapps: ProductsInfo[];
} = {
  libraries: [
    {
      link:
        'https://github.com/noshiro-pf/mono/tree/master/packages/utils/syncflow',
      title: 'SyncFlow（開発中）',
      subtitle: 'リアクティブプログラミング用のJavaScriptのライブラリ',
      body1:
        'RxJS風の構文のリアクティブプログラミングライブラリ。前作の「rnjs」と同じく「グリッチ」が起きないRxJSを目指し作ったものだが、rnjs で発生したパフォーマンスの問題を解決するために内部実装を全面的に刷新。',
      body2: 'TypeScriptで実装中。（最終更新：2020年7月）',
      imageUrl: '',
    },
    {
      link:
        'https://github.com/noshiro-pf/mono/tree/master/packages/utils/rnjs',
      title: 'rnjs',
      subtitle: 'リアクティブプログラミング用のJavaScriptのライブラリ',
      body1:
        'RxJS風の構文のリアクティブプログラミングライブラリ。RxJSで発生しうる「グリッチ」という現象が起きないようにしたもの（Observableの発火をpriority queueで管理している）。',
      body2:
        'TypeScriptで実装。npmで"rnjs"という名前で公開。（最終更新：2019年1月）',
      imageUrl: '',
    },
  ],
  webapps: [
    {
      link: 'https://event-schedule-app.web.app/',
      title: 'イベント日程調整ツール2',
      subtitle: 'イベントのスケジュール調整用アプリケーション',
      body1: '',
      body2:
        'React・TypeScript・Immutable.js・RxJSで実装。CSSライブラリに Blueprint.js を使用。バックエンドはFirebase FirestoreとFunctions（最終更新：2020年1月05日）',
      imageUrl: EventScheduleApp2Image,
    },
    {
      link: 'https://annotation-tool-d8b49.web.app/',
      title: 'アノテーションツール（開発途中）',
      subtitle: '矩形ツールによる画像アノテーションを行うUI',
      body1:
        'polygon, paint toolやkey-pointなどのアノテーションもできるようにしたい。',
      body2:
        'React・TypeScript・Pixi.jsで実装。CSSライブラリに Blueprint.js を使用。（最終更新：2020年9月28日）',
      imageUrl: '',
    },
    {
      link: 'https://housing-loan-calculator.web.app',
      title: '住宅ローン返済シミュレータ',
      subtitle: '住宅ローンの月々の返済額などを計算',
      body1: 'Chrome推奨。クエリパラメータでスナップショットを保存可能。',
      body2:
        'React・TypeScriptで実装。CSSライブラリに Blueprint.js を使用。（制作日：2019年11月17日、最終更新：2020年9月06日）',
      imageUrl: HousingLoanCalculatorImage,
    },
    {
      link: 'https://color-demo-app.web.app',
      title: 'Color Contrast Demo',
      subtitle:
        '色のコントラストなどについて書いた記事（https://qiita.com/pikohideaki/items/59415524503f833ce41e）のために作ったデモアプリ。',
      body1: 'Chrome推奨。',
      body2:
        'React・TypeScriptで実装。CSSライブラリに material-UI を使用。（制作日：2019年12月07日、最終更新：2020年1月27日）',
      imageUrl: ColorDemoImage,
    },
    {
      link: 'https://catan-dice-5f3bc.web.app/',
      title: 'CATAN dice',
      subtitle:
        '6面ダイス2個を振って合計を表示するカタン（ボードゲーム）用サポートアプリ',
      body1:
        '同じ目が出ても振ったかどうか分かるようなエフェクトを付けている。ダイスを転がすアニメーション等があってもよいかもしれない。',
      body2:
        'React・RxJS・TypeScriptで実装。RxJSはリングの透明度変化を扱うために使用した（連打時に前のアニメーションをキャンセルする処理）。（制作時期：2019年7月）',
      imageUrl: CatanDiceImage,
    },
    {
      link: 'https://my-profile-app-ec7bf.web.app',
      title: 'プロフィール',
      subtitle: 'このページ',
      body1: 'Chrome推奨。',
      body2:
        'React・TypeScript・Material UIで実装。静的ページだが、Markdownでモバイル端末でも簡単に編集できるように、 Dropbox上に置いたMarkdown形式テキストを fetchし"ReactMarkdown"により表示するようにした。タブ切り替えをreact-routerで行うように変更（2020/08/04）。（最終更新：右上に記載）',
      imageUrl: '',
    },
    {
      link: 'https://pikoappsproduct.firebaseapp.com/#/',
      title: 'イベント日程調整ツール',
      subtitle: 'イベントのスケジュール調整用アプリケーション',
      body1:
        'Chrome推奨。調整さんを使いやすくし高機能にしたもの。（作成画面 → ○△×以外の記号の追加・点数の設定・回答締め切り日の設定、回答画面 → 回答のソート。） ToDo：Google Calendar等との連携オプション、回答締切前のリマインド送信',
      body2:
        'Angular・RxJS・TypeScriptで実装。バックエンドはFirebase Realtime DB。（最終更新：2019年1月）',
      imageUrl: ScheduleImage,
    },
    {
      link: 'https://tools-8af31.firebaseapp.com/#/toybox/mnist',
      title: 'MNIST App',
      subtitle: '手書き数字認識のデモアプリケーション',
      body1: 'Chrome推奨。「ゼロから作るDeep Learning」第7章のCNN。',
      body2:
        'Angular・RxJS・TypeScriptで実装。推論器(CNN)はTypeScriptでスクラッチで実装（教科書ではPythonで実装していたのでnumpyの一部の関数もTypeScriptに移植した）。テストデータでの精度は>98%だが、単純なモデルなので汚く書くと正解できないことも多い。パラメータはjson形式のテキストデータをダウンロードしているので初期読み込みが少し遅い。（制作時期：2018年9月）',
      imageUrl: MnistAppImage,
    },
    {
      link: 'https://dominionapps.firebaseapp.com/#/online-game',
      title: '「ドミニオン」オンライン対戦（要ログイン）',
      subtitle: 'カードゲーム「ドミニオン」のオンライン対戦アプリ',
      body1:
        'ブラウザで2～4人の対戦に対応。LINE風のチャット機能付き。ゲーム結果は集計表で確認できる。基本セットを中心に実装が簡単なカードのみ実装した。ToDo: パフォーマンスチューニング、拡張セットの実装。',
      body2:
        'Angular・RxJS・TypeScriptで実装。バックエンドはFirebase Realtime DB。（制作時期（旧バージョン含む）：2016年12月～2018年3月）',
      imageUrl: DominionOnlineImage,
    },
    {
      link: 'https://lambda-calculus-interpre-70e41.web.app',
      title: 'Lambda Calculus Interpreter',
      subtitle: '簡単な型無しラムダ計算のインタプリタ',
      body1:
        "Chrome推奨。使えるアルファベットは [a-z]。一部のマクロ（'+', 'PLUS', 'SUCC', 数字）に対応。括弧の省略は未対応。もうちょっと高機能にしたい。",
      body2:
        'Angular・RxJS・TypeScriptで実装。（制作時期：2017年12月 → 2019年8月7日にReactで再実装）',
      imageUrl: LambdaInterpreterAppImage,
    },
    {
      link: 'https://tools-8af31.firebaseapp.com/#/tools-collection/tsv2json',
      title: 'CSV to JSON',
      subtitle: 'CSVテキストデータをJSONデータに変換',
      body1:
        'Chrome推奨。表データをテーブルでプレビューできる。区切り文字をタブとカンマから選択。テーブルのヘッダを指定可能。',
      body2: 'Angular・RxJS・TypeScriptで実装。（制作時期：2017年）',
      imageUrl: '',
    },
    {
      link:
        'https://tools-8af31.firebaseapp.com/#/tools-collection/json-pretty-print',
      title: 'JSON pretty print',
      subtitle: 'JSONテキストデータの整形',
      body1: 'Chrome推奨。難読化されたJSONテキストデータを整形して出力する',
      body2: 'Angular・RxJS・TypeScriptで実装。（制作時期：2017年）',
      imageUrl: '',
    },
  ],
};
