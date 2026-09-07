import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { oxlintConfigOffForSumiCheck } from '../../src/index.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/** Writes `oxlint-config-off.json` (the JSON form of oxlintConfigOffForSumiCheck). */
// eslint-disable-next-line security/detect-non-literal-fs-filename
await fs.writeFile(
  path.join(projectRootPath, 'oxlint-config-off.json'),
  `${JSON.stringify(oxlintConfigOffForSumiCheck, undefined, 2)}\n`,
);
