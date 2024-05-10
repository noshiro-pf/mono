import * as nodePath from 'node:path';
import * as nodeUrl from 'node:url';

export const toThisDir = (importMetaUrl: string): string =>
  nodePath.dirname(nodeUrl.fileURLToPath(importMetaUrl));
