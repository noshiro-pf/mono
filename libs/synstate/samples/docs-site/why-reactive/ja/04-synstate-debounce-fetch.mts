import {
  createState,
  debounce,
  fromAbortablePromise,
  skipIfNoChange,
  switchMap,
} from 'synstate';

// embed-sample-code-ignore-above
// SynState： コンポーネントの外での宣言的パイプライン
const [query, setQuery] = createState('');

const results = query
  .pipe(debounce(300)) // 入力の一時停止を待つ
  .pipe(skipIfNoChange()) // デバウンス後の値が同じならスキップ
  .pipe(
    // 新しいクエリが来たら前の fetch をキャンセル
    switchMap((q) =>
      fromAbortablePromise((signal) =>
        fetch(`/api/search?q=${q}`, { signal }).then((r) => r.json()),
      ),
    ),
  );
// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(query, setQuery, results);

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}
