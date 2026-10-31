import { createValueEmitter, scan } from 'synstate';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('counting events with scan (SynState)', () => {
    // embed-sample-code-ignore-above
    // リスト項目のクリック。項目の id として送る。
    const [clicked, click] = createValueEmitter<string>();

    const clickCount = clicked.pipe(scan((n) => n + 1, 0));

    let mut_count = 0;

    clickCount.subscribe((n) => {
      mut_count = n;
    });

    click('A');

    click('A'); // 同値かどうかに関わらず、発行はすべてイベント

    click('B');

    click('C');

    // 4 回のクリックが 4 回と数えられる
    // embed-sample-code-ignore-below
    assert.strictEqual(mut_count, 4);
  });
}
