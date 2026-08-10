---
title: SynState の強み
description: SynState を選ぶ理由 — グリッチフリー、軽量、型安全、React Compiler 互換の状態管理ライブラリ。
sidebar:
    order: 1
---

## シンプルに始められ、必要に応じてパワフルに

SynState は Web フロントエンド向けの状態管理ライブラリです。ほとんどのユースケースでは、`createState`、`createReducer`、そして `combine` や `map` のようなシンプルなコンビネーターだけで十分です — React の `useState` / `useReducer` と同じくらい直感的でありながら、グローバル状態を管理できるクリーンで最小限の API です。例えば、[シンプルなカウンター](/synstate/ja/examples/react/#global-counter-state)はわずか数行で実装できます：

```tsx
import { createState } from 'synstate-react-hooks';

const [useCount, , { updateState }] = createState(0);

const Counter = () => {
    const count = useCount();
    return <button onClick={() => updateState((n) => n + 1)}>{count}</button>;
};
```

要件がより複雑になっても、SynState は対応できます。シンプルな[ダークモード切替](/synstate/ja/examples/react/#boolean-state-dark-mode)から[自動キャンセル付きデバウンス検索パイプライン](/synstate/ja/examples/advanced/#search-with-debounce)まで、すべてを統一された API で記述できます。

## なぜ Observable ベースなのか？

実際の状態管理は単純な get/set にとどまりません。フィルター入力にはデバウンスが、API 呼び出しにはキャンセルが必要で、複数のソースが同時に変化したときに派生値は一貫性を保たなければなりません。これらの要件には、**非同期データフロー**と**依存関係の自動伝播**を宣言的に表現できるシステムが求められます。

SynState は Observable パターンの上に構築されています。状態を、合成・変換・結合できる値のストリームとしてモデル化するパターンです。これにより、RxJS のような別のライブラリを必要とせず、豊富なオペレーター（`debounce`、`throttle`、`switchMap`、`mergeMap` 等）を利用できます。

実際にどのように機能するか、命令的なコードとの比較については[宣言的な状態管理](/synstate/ja/guides/declarative-state-management/)を参照してください。

## 高パフォーマンス、グリッチフリー

Observable パターン自体は新しいものではありません。RxJS が何年もかけて普及させてきました。しかし RxJS には**グリッチ問題**という根本的な正確性の課題があります。複数の派生値が共通のソースを持つとき、`combineLatest` は一部の入力が更新されたが他はまだ古いままの不整合な中間状態を emit してしまいます。この問題は依存グラフが複雑になるほど深刻化します。例えば、1つのソースから複数の派生値を作り再び結合する「ダイアモンド型」の依存関係では、結合の数に応じて冗長な計算が $O(n^2)$ にスケールし、さらにこのダイアモンドが直列に連なると $O(D^n)$（$D$ = 1段あたりの分岐数）と指数関数的に増大します。

SynState はこれを**深さ順伝播**アルゴリズムで解決しています。すべての派生値がその祖先すべてが更新された後にのみ更新されることを保証し、$O(n)$ の単一パスで処理します。グリッチなし、冗長な計算なし、優先度キューも不要です。

| 特徴                        | RxJS                                                                                    | SynState                                                                       |
| :-------------------------- | :-------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **グリッチフリー**          | No — `combineLatest` が中間状態を emit する                                             | Yes — depth 順の伝播により一貫性を保証                                         |
| **伝播コスト**              | ツリーでは $O(n)$、ダイアモンドが直列に連なると最大 $O(D^n)$（$D$ = 1段あたりの分岐数） | すべてのケースで $O(n)$                                                        |
| **`InitializedObservable`** | なし — 最初の emission まで値がない場合がある                                           | 組み込み — 常に値を保持し、状態の表現に最適                                    |
| **設計の焦点**              | 汎用的な非同期イベント処理                                                              | 状態管理が第一、非同期オペレーター（`debounce`、`switchMap` 等）も完全サポート |

詳細な説明は [SynState はグリッチをどう解決したか](/synstate/ja/internals/how-synstate-solved-the-glitch/)を参照してください。

## React Compiler と完全互換

SynState のすべてのリアクティブ計算（`combine`、`map`、`filter` など）は React のレンダリングサイクルの**外側**で完了します。コンポーネントは `useSyncExternalStore`（React のファーストクラス API）を通じて値を読み取るだけであり、レンダリング中に暗黙的な副作用を持ちません — Proxy ベースの追跡も、プロパティアクセスによる隠れたサブスクリプションもありません。そのため、React Compiler はこれらのコンポーネントを安全に解析・メモ化でき、[React Compiler](https://react.dev/learn/react-compiler) の自動メモ化と完全に整合します。

MobX の `observer()` HOC はレンダリング中に observable へのアクセスを追跡するため、React Compiler のメモ化と衝突し、`"use no memo"` ディレクティブによる opt-out が必要です。SynState ではこのような回避策は不要です。

## ユースケース

**SynState が適しているケース：**

- ✅ コンポーネント間で共有するグローバル状態（ダークモード切替、ユーザーセッションなど）。
- ✅ `debounce`、`throttle`、`switchMap` などのオペレーターを使った複雑な非同期状態管理。
- ✅ Redux ライクな reducer による状態管理（`createReducer`）。
- ✅ 状態管理の規模が未定のプロジェクト。SynState の統一された API は、単一の共有カウンターから完全なデバウンス検索パイプラインまですべてをカバーするため、要件が増えてもライブラリを切り替える必要がありません。
- ✅ 型安全なイベントエミッター（`createEventEmitter`）。

**他のソリューションを検討すべきケース：**

- コンポーネントインスタンスごとに独立した状態が必要な場合 — 例えば、フォームの各入力フィールドの値、アコーディオンの開閉状態、モーダルの表示/非表示など、同じコンポーネントが画面上に複数インスタンス存在し、それぞれが独立した状態を持つケースです。これらはグローバルステートで管理するとインスタンスの生成・破棄に合わせた配列管理が必要になりコードが複雑化するため、React hooks の `useState` / `useReducer` でコンポーネントローカルに管理するのが自然です。

## 次のステップ

- [宣言的な状態管理](/synstate/ja/guides/declarative-state-management/) — 具体的な例でリアクティブプログラミングモデルを理解する。
- [React 連携](/synstate/ja/guides/react-integration/) — SynState を React で使う。
- [ライブラリ比較](/synstate/ja/guides/library-comparison/library-comparison/) — SynState と RxJS、Jotai、MobX 等の比較。
- [パフォーマンスベンチマーク](/synstate/ja/guides/library-comparison/benchmark/) — スループットの定量比較。
- [インタラクティブデモ](/synstate/ja/guides/library-comparison/interactive-demo/) — 違いを体感する。
