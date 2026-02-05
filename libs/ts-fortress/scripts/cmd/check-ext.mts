import { assertExt } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await assertExt({
  directories: [
    {
      path: path.resolve(projectRootPath, './src'),
      extension: '.mts',
    },
    {
      path: path.resolve(projectRootPath, './scripts'),
      extension: ['.mts', '.md'],
    },
  ],
});
