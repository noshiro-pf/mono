import * as path from 'node:path';
import * as url from 'node:url';

export const toThisDir = (importMetaUrl: string): string =>
  path.dirname(url.fileURLToPath(importMetaUrl));
