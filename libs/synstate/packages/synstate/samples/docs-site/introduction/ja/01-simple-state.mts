import { createState } from 'synstate';

// リアクティブな状態を作成
const [state, setState] = createState(0);

// 変更を購読
state.subscribe((count) => {
  console.log(count); // 0, 1
});

// 状態を更新
setState(1);

// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}
