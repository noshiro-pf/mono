import { map, source } from 'synstate';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('synstate-is-synchronous', () => {
    // embed-sample-code-ignore-above
    const count = source<number>();

    const doubled = count.pipe(map((n) => n * 2));

    const mut_log: string[] = [];

    const subscription = doubled.subscribe((n) => {
      mut_log.push(`doubled: ${n}`);
    });

    mut_log.push('before next');

    count.next(1);

    mut_log.push('after next');

    assert.deepStrictEqual(mut_log, [
      'before next',
      'doubled: 2',
      'after next',
    ]);

    subscription.unsubscribe();
    // embed-sample-code-ignore-below
  });
}
