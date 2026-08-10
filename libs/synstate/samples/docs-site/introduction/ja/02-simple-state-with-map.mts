/* eslint-disable @stylistic/padding-line-between-statements */
// embed-sample-code-ignore-above
import {
  combine,
  createState,
  type InitializedObservable,
  map,
} from 'synstate';

const [count, setCount] = createState<number>(0);

// 現在の値を取得
console.log(count.getSnapshot().value); // 0

// pipe で新しい Observable を派生
const doubled: InitializedObservable<number> = count.pipe(map((n) => n * 2));

// 複数の Observable を結合
const combined: InitializedObservable<string> = combine([count, doubled]).pipe(
  map(([c, d]) => `(${c}, ${d})`),
);

// 変更を購読
count.subscribe((value) => {
  console.log('count:', value); // 0, 1, 2, 3
});

doubled.subscribe((value) => {
  console.log('doubled:', value); // 0, 2, 4, 6
});

combined.subscribe((value) => {
  console.log(value); // "(0, 0)", "(1, 2)", "(2, 4)", "(3, 6)"
});

// 状態を更新
setCount(1);
setCount(2);
setCount(3);

// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}
