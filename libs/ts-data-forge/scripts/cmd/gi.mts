import { genIndex } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

try {
  await genIndex({
    targetDirectory: path.resolve(projectRootPath, './src'),
    excludePatterns: ['*.d.mts', '*.test.mts', 'entry-point.mts'],
  });
} catch (error) {
  console.error(`Error: ${String(error)}`);
  process.exit(1);
}
