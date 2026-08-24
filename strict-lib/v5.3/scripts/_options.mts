import * as path from 'node:path';
import { type CreateContextOptions } from 'strict-ts-lib-scripts-common/context';
import { versionConfig } from './version-config.mjs';

const packageRoot = path.resolve(import.meta.dirname, '..');

export const options: CreateContextOptions = {
  packageRoot,
  versionConfig,
} as const;
