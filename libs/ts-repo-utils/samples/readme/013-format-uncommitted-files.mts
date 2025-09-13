import { formatUncommittedFiles } from 'ts-repo-utils';

// Format only modified files
await formatUncommittedFiles();

// With custom options
await formatUncommittedFiles({
  untracked: false, // Skip untracked files
  ignore: (filePath) => filePath.includes('test'),
});
