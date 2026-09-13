/* eslint-disable import-x/no-default-export */
// embed-sample-code-ignore-above
import { defineConfig } from 'vite';

export default defineConfig({
  // ... other config
  build: {
    rolldownOptions: {
      treeshake: {
        // Calls to these functions are treated as side-effect free, so
        // statements that only call them are removed from the bundle.
        manualPureFunctions: ['expectType'],
      },
    },
  },
});

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('defineConfig passes the treeshake option through unchanged', () => {
    const options = {
      build: {
        rolldownOptions: {
          treeshake: { manualPureFunctions: ['expectType'] },
        },
      },
    } as const;

    assert.deepStrictEqual(defineConfig(options), options);
  });
}
