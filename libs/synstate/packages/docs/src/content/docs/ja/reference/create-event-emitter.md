---
prev: false
next: false
title: createEventEmitter
---

<!-- jsdoc-description -->

ペイロードなしのイベント（void イベント）用のイベントエミッターを作成します。
[observable, emitter 関数] のタプルを返します。

<!-- /jsdoc-description -->

## 使用例

```tsx
const [click$, emitClick] = createEventEmitter();

const mut_clickCount = { value: 0 };

click$.subscribe(() => {
    mut_clickCount.value += 1;
});

emitClick(); // logs: Clicked!

assert.deepStrictEqual(mut_clickCount.value, 1);

emitClick();

emitClick();

assert.deepStrictEqual(mut_clickCount.value, 3);
```
