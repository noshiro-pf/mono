---
prev: false
next: false
title: 索引
sidebar:
    order: 1
---

## 状態管理

SynStateはアプリケーションの状態を管理するためのシンプルで直感的なAPIを提供します：

- [**`createState`**](../create-state/): `InitializedObservable`とsetterで状態を作成。
- [**`createReducer`**](../create-reducer/): reducerと初期値で状態を作成。
- [**`createBooleanState`**](../create-boolean-state/): 真偽値に特化した状態管理。

## イベントシステム

イベント駆動パターンのための組み込みイベントエミッター：

- [**`createValueEmitter`**](../create-value-emitter/): 型安全なイベントエミッターを作成。
- [**`createEventEmitter`**](../create-event-emitter/): ペイロードなしのイベントエミッターを作成。

## Observable API

複雑なシナリオに対応するため、SynStateはObservableベースのAPIを提供します：

### 生成関数

- [`source<T>()`](../source/): 新しいObservableソースを作成（RxJSの`subject`とほぼ同等）。
- [`just(value)`](../just/): 単一の静的な値を保持し即座に完了するObservableを作成。`switchMap` 内の同期フォールバックとして有用。
- [`fromPromise(promise)`](../from-promise/): PromiseからObservableを作成。
- [`fromSubscribable()`](../from-subscribable/): 任意のsubscribableオブジェクトからObservableを作成。
- [`counter(ms)`](../counter/): 一定間隔で値を発行（RxJSの`interval`とほぼ同等）。
- [`timer(delay)`](../timer/): 遅延後に発行。

### 結合

- [`combine(observables)`](../combine/): 複数のソースから最新の値を結合（別名： `combineLatest`）。
- [`merge(observables)`](../merge/): 複数のストリームをマージ。
- [`zip(observables)`](../zip/): インデックスごとに値をペアリング。

### 演算子

#### map系

- [`map(fn)`](../map/): 値を変換。
- [`mapTo(value)`](../map-to/): すべての値を定数にマッピング。
- [`getKey(key)`](../get-key/): オブジェクトからプロパティ値を抽出（別名： `pluck`）。
- [`attachIndex()`](../attach-index/): 各値にインデックスを付与（別名： `withIndex`）。

#### Result/Optional

- [`mapOptional(fn)`](../map-optional/): Optional値に対してmapを適用。
- [`mapResultOk(fn)`](../map-result-ok/): Resultのok値に対してmapを適用。
- [`mapResultErr(fn)`](../map-result-err/): Resultのerror値に対してmapを適用。
- [`unwrapOptional()`](../unwrap-optional/): Optional値をundefinedにアンラップ。
- [`unwrapResultOk()`](../unwrap-result-ok/): Resultのok値をundefinedにアンラップ。
- [`unwrapResultErr()`](../unwrap-result-err/): Resultのerror値をundefinedにアンラップ。

#### Flat map

- [`mergeMap(fn)`](../merge-map/): Observableにマッピングしてすべてをマージ（並列実行）（別名： `flatMap`）。
- [`switchMap(fn)`](../switch-map/): Observableにマッピングして最新に切り替え（前のものをキャンセル）。

#### フィルタリング

- [`filter(predicate)`](../filter/): 値をフィルタリング。
- [`skipIfNoChange()`](../skip-if-no-change/): 重複する値をスキップ（別名： `distinctUntilChanged`）。
- [`skip(n)`](../skip/): 最初のn回の発行をスキップ。
- [`take(n)`](../take/): 最初のn回の発行を取得して完了。
- [`skipWhile(predicate)`](../skip-while/): 述語がtrueの間、値をスキップ。
- [`takeWhile(predicate)`](../take-while/): 述語がtrueの間、値を発行し、その後完了。
- [`skipUntil(notifier)`](../skip-until/): notifierが発行するまで値をスキップ。
- [`takeUntil(notifier)`](../take-until/): notifierの発行で完了。

#### 時系列処理

- [`audit(ms)`](../audit/): 指定した時間ウィンドウ後に最後の値を発行（RxJSの`auditTime`とほぼ同等）。
- [`debounce(ms)`](../debounce/): 発行をデバウンス（RxJSの`debounceTime`とほぼ同等）。
- [`throttle(ms)`](../throttle/): 発行をスロットル（RxJSの`throttleTime`とほぼ同等）。

#### その他

- [`pairwise()`](../pairwise/): 前回と今回の値をペアとして発行。
- [`scan(reducer, seed)`](../scan/): 値を蓄積。
- [`withBuffered(observable)`](../with-buffered/): Observableからの値をバッファリングし、親とともに発行（別名： `withBufferedFrom`）。
- [`withCurrentValueFrom(observable)`](../with-current-value-from/): 別のObservableから現在の値をサンプリング（別名： `withLatestFrom`）。
- [`withInitialValue(value)`](../with-initial-value/): 未初期化のObservableに初期値を提供。

### ユーティリティ

- `isChildObservable(obs)`: ObservableがChild Observableかどうかを判定。
- `isManagerObservable(obs)`: ObservableがManager Observableかどうかを判定。
- `isRootObservable(obs)`: ObservableがRoot Observableかどうかを判定。

## フレームワーク連携

### React / Preact Hooks (`synstate-react-hooks` / `synstate-preact-hooks`)

両パッケージは同一のAPI面を持ちます。React 18+には`synstate-react-hooks`、Preactには`synstate-preact-hooks`を使用してください。

#### フック

- **`useObservableValue(observable$)`**: Observableを購読し、現在の値をコンポーネントの状態として返す。内部的に`useSyncExternalStore`を使用し、Observableが値を発行するとコンポーネントが再レンダリングされる。
- **`useObservableValue(observable$, fallback)`**: 上記と同じ。初期値を持たないObservableに対するフォールバック値を指定。
- **`useObservableEffect(observable$, fn)`**: Observableが値を発行するたびに副作用を実行。アンマウント時に自動的にサブスクリプションを解除。
- **`useValueAsObservable(value)`**: コンポーネントのpropやstateの値をsynstateのObservableに変換。React/Preactの状態をObservableグラフに橋渡しする際に有用。

#### 状態ラッパー

コアの`createState` / `createReducer` / `createBooleanState`を再エクスポートしますが、タプルの最初の要素としてraw Observableの代わりに**フック**（`useCurrentValue`）を返します:

- **`createState(initialValue)`**: `[useCurrentValue, setState, { state, updateState, resetState, getSnapshot, initialState }]`を返す。
- **`createReducer(reducer, initialState)`**: `[useCurrentValue, dispatch, { state, getSnapshot, initialState }]`を返す。
- **`createBooleanState(initialValue)`**: `[useCurrentValue, { state, setTrue, setFalse, toggle, setState, updateState, resetState, getSnapshot, initialState }]`を返す。

### Preact Signals (`synstate-preact-signals`)

synstateのObservableと[Preact Signals](https://preactjs.com/guide/v10/signals/)を橋渡しし、コンポーネントの再レンダリングなしにきめ細かいDOM更新を実現します。hooksアプローチとの比較は[インタラクティブデモ](/synstate/ja/preact-signals/demo/)を参照してください。

#### ブリッジ関数

- **`toSignal(observable$)`**: `Observable`（または`InitializedObservable`）をPreactの`ReadonlySignal`に変換。SignalはObservableと同期し続ける。JSXに直接埋め込み可能 — コンポーネント全体ではなく、影響を受けるテキストノードのみが更新される。
- **`toSignal(observable$, fallback)`**: 上記と同じ。初期値を持たないObservableに対するフォールバック値を指定。
- **`fromSignal(signal)`**: Preactの`Signal`をsynstateの`InitializedSourceObservable`に変換。`[observable, dispose]`を返す。ObservableはSignalの値をミラーリングし、synstateのオペレーターチェーン（`map`、`debounce`、`switchMap`等）を適用可能。

#### 状態ラッパー

hooksラッパーと同じですが、フックの代わりに**`ReadonlySignal`**を返します:

- **`createState(initialValue)`**: `[signal, setState, { state, updateState, resetState, getSnapshot, initialState }]`を返す。
- **`createReducer(reducer, initialState)`**: `[signal, dispatch, { state, getSnapshot, initialState }]`を返す。
- **`createBooleanState(initialValue)`**: `[signal, { state, setTrue, setFalse, toggle, setState, updateState, resetState, getSnapshot, initialState }]`を返す。
