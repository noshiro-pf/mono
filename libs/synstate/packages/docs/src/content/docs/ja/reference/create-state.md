---
prev: false
next: false
title: createState
---

<!-- jsdoc-description -->

getter および setter メソッドを備えたリアクティブな状態コンテナを作成します。
Observable による状態管理のシンプルなソリューションを提供します。

<!-- /jsdoc-description -->

## 使用例

```tsx
const [state, setState, { updateState, resetState }] = createState(0);

const stateHistory: number[] = [];

state.subscribe((value: number) => {
    stateHistory.push(value);
});

assert.deepStrictEqual(stateHistory, [0]);

setState(10); // logs: 10

assert.deepStrictEqual(stateHistory, [0, 10]);

updateState((prev: number) => prev + 1); // logs: 11

assert.deepStrictEqual(stateHistory, [0, 10, 11]);

resetState(); // logs: 0

assert.deepStrictEqual(stateHistory, [0, 10, 11, 0]);
```
