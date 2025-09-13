import { assertExt, assertPathExists, assertRepoIsClean } from 'ts-repo-utils';

// Check required files exist (exits with code 1 if files don't exist)
await assertPathExists('./package.json', 'Package manifest');
await assertPathExists('./tsconfig.json', 'TypeScript config');

// Validate extensions
await assertExt({
  directories: [
    { path: './src', extension: '.ts' },
    { path: './scripts', extension: '.mjs' },
  ],
});

// Verify clean repository state (exits with code 1 if repo is dirty)
await assertRepoIsClean();
