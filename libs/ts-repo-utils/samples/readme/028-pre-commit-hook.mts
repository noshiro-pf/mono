import {
  assertExt,
  assertRepoIsClean,
  formatUncommittedFiles,
} from 'ts-repo-utils';

// Validate file extensions
await assertExt({
  directories: [{ path: './src', extension: '.ts' }],
});

// Format changed files
await formatUncommittedFiles();

// Ensure repository is clean (exits if dirty)
await assertRepoIsClean();
