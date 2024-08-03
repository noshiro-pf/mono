/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/no-restricted-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { autoImportDef } from '@noshiro/global-ts-utils/auto-imports';
import { castDeepMutable } from '@noshiro/ts-utils';
import autoImport from 'unplugin-auto-import/esbuild';

export const autoImportsDef = autoImport({
  include: [/\.m?[jt]sx?$/u],
  dts: false,
  /* options */
  imports: [castDeepMutable(autoImportDef)],
});
