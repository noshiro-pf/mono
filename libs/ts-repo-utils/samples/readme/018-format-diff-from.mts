import { formatDiffFrom } from 'ts-repo-utils';

// Format files different from main branch
await formatDiffFrom('main');

// Format files different from specific commit
await formatDiffFrom('abc123');

// With custom options
await formatDiffFrom('main', {
  includeUntracked: false,
});
