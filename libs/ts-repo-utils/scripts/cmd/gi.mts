import { genIndex } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

try {
  await genIndex({
    targetDirectory: path.resolve(projectRootPath, './src/functions'),
    excludePatterns: ['*.d.mts', '*.test.mts'],
    indexExtension: '.mts',
    exportExtension: '.mjs',
    sourceExtensions: ['.mts'],
    formatCommand: 'npm run fmt',
  });
} catch (error) {
  console.error(`Error: ${String(error)}`);
  process.exit(1);
}
