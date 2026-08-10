// Example: src/guard/key-is-in.mts (keyIsIn)
import { keyIsIn } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const user = { id: 1, name: 'Ada' } as const;

    const maybeKey: string = 'name';

    if (keyIsIn(maybeKey, user)) {
      assert.isTrue(user[maybeKey] === 'Ada');
    } else {
      assert.fail();
    }

    // embed-sample-code-ignore-below
  });
}
