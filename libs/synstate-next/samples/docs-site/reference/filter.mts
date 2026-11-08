import { createValueEmitter, filter } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('filter', () => {
    // embed-sample-code-ignore-above
    const [keyPressed, pressKey] = createValueEmitter<string>();

    const enter = keyPressed.pipe(filter((key) => key === 'Enter'));

    const mut_seen: string[] = [];

    enter.subscribe((key) => {
      mut_seen.push(key);
    });

    pressKey('a');

    pressKey('Enter');

    assert.deepStrictEqual(mut_seen, ['Enter']);

    // embed-sample-code-ignore-below
  });
}
