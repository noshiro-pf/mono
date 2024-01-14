import * as fs from 'node:fs/promises';
import { getSrcFileList } from './common.mjs';
import { convert } from './convert-main.mjs';

const srcDir = './temp';
const distDir = '../packages';

/** @type {boolean} */
const commentOutDeprecated = false;

const srcFileList = await getSrcFileList(srcDir);

await Promise.all(
  srcFileList.map(async ({ content, filename }) => {
    if (filename === 'lib.d.ts') return;

    // eslint-disable-next-line no-restricted-syntax
    const suffix = filename
      .replaceAll('lib.', 'lib-')
      .replaceAll('.d.ts', '')
      .split('.');

    const outputDir = `${distDir}/${suffix.join('/')}`;

    try {
      await fs.access(outputDir);
    } catch {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(outputDir, { recursive: true });
    }

    {
      const outputFile = `${outputDir}/index.d.ts`;

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(
        outputFile,
        convert(content, filename, true, commentOutDeprecated),
      );

      console.log(`${outputFile} generated.`);
    }

    const typescriptPackageJson = await fs
      .readFile('../../../node_modules/typescript/package.json', 'utf8')
      // eslint-disable-next-line no-restricted-globals
      .then((s) => JSON.parse(s));

    const typescriptVersion =
      typeof typescriptPackageJson === 'object' &&
      typescriptPackageJson !== null &&
      !Array.isArray(typescriptPackageJson) &&
      Object.hasOwn(typescriptPackageJson, 'version') &&
      typeof typescriptPackageJson.version === 'string'
        ? typescriptPackageJson.version
        : '1.0.0';

    {
      const outputFile = `${outputDir}/package.json`;

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(
        outputFile,
        [
          `{`,
          `  "name": "@noshiro/${suffix.join('-')}",`,
          `  "version": "${typescriptVersion}",`,
          `  "private": false,`,
          `  "license": "MIT",`,
          `  "author": "noshiro",`,
          `  "sideEffects": false,`,
          `  "type": "module",`,
          `  "description": "Strict TypeScript lib",`,
          `  "types": "./index.d.ts",`,
          `  "peerDependencies": {`,
          `    "typescript": ">=4.5.2"`,
          `  }`,
          `}`,
        ].join('\n'),
      );

      console.log(`${outputFile} generated.`);
    }
  }),
);
