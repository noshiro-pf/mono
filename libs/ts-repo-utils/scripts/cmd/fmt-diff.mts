import { formatDiffFrom } from '../../src/index.mjs';

try {
  await formatDiffFrom('main');
} catch (error) {
  console.error(`Error: ${String(error)}`);
  process.exit(1);
}
