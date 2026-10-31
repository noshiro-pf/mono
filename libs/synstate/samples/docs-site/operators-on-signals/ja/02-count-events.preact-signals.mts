import { batch, effect, signal } from '@preact/signals-core';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('counting events written as an effect (Preact Signals)', () => {
    // embed-sample-code-ignore-above
    // リスト項目のクリック。項目の id として送る。
    const clicked = signal<string | undefined>(undefined);

    const clickCount = signal(0);

    // scan((n) => n + 1, 0) を effect で書いたもの。
    effect(() => {
      if (clicked.value !== undefined) {
        clickCount.value = clickCount.peek() + 1;
      }
    });

    clicked.value = 'A';

    clicked.value = 'A'; // 同じ項目をもう一度: 同値なので捨てられる

    batch(() => {
      // 1 つの batch で処理した 2 回のクリック: effect は最後のものしか見ない
      clicked.value = 'B';

      clicked.value = 'C';
    });

    // 4 回のクリックが 2 回と数えられる
    // embed-sample-code-ignore-below
    assert.strictEqual(clickCount.value, 2);
  });
}
