import { genIndex } from '../../src/functions/gen-index.mjs';
import '../../src/node-global.mjs';
import { projectRootPath } from '../project-root-path.mjs';

try {
  await genIndex({
    formatCommand: 'npm run fmt',
    targetDirectory: path.resolve(projectRootPath, './src/functions'),
    sourceExtensions: ['.mts'],
    indexExtension: '.mts',
    exportExtension: '.mjs',
  });
} catch (error) {
  console.error(`Error: ${String(error)}`);
  process.exit(1);
}
