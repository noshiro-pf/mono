import * as styles from './root.module.css';

// Vitest stubs a CSS Module it does not process, and the stub has no named
// exports; `tools/configs/vite-config.mts` is what makes it process them.
test('a CSS Module exports its classes by name under Vitest', () => {
  assert.isString(styles.root);

  assert.include(styles.root, 'root');
});
