import { assertExt } from 'ts-repo-utils';

await assertExt({
  directories: [
    {
      path: './src',
      extension: '.ts',
      ignorePatterns: ['*.d.ts', '*.test.ts'],
    },
    {
      path: './scripts',
      extension: '.mjs',
    },
  ],
});
