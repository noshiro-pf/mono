import * as path from 'node:path';

export const workspaceRootPath: string = path.resolve(
  import.meta.dirname,
  '..',
);
