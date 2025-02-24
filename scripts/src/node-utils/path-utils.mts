import * as url from 'node:url';
import 'zx/globals';

export const toThisDir = (importMetaUrl: string): string =>
  path.dirname(url.fileURLToPath(importMetaUrl));
