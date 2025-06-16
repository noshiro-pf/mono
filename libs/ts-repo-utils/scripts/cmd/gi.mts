import { genIndex } from '../../src/functions/gen-index.mjs';
import '../../src/node-global.mjs';

await genIndex({
  targetDirectory: path.resolve(projectRootPath, './src/functions'),
});
