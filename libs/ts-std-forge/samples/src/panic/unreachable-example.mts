// The `default` arm is what this example is about: `unreachable` is how an
// exhaustive switch says so. The rule sees the arm as dead code.
/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
// Example: src/panic/panic.mts (unreachable)
import { unreachable } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Shape = Readonly<{ kind: 'circle' } | { kind: 'square' }>;

    const area = (shape: Shape): number => {
      switch (shape.kind) {
        case 'circle':
          return 1;
        case 'square':
          return 2;
        default:
          return unreachable(shape);
      }
    };

    assert.isTrue(area({ kind: 'circle' }) === 1);

    // embed-sample-code-ignore-below
  });
}
