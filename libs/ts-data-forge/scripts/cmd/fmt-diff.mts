import { formatDiffFrom } from 'ts-repo-utils';

try {
  await formatDiffFrom('main');
} catch (error) {
  console.error(`Error: ${String(error)}`);
  process.exit(1);
}
