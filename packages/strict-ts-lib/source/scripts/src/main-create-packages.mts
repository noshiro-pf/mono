import * as fs from 'node:fs/promises';
import typescriptPackageJson from 'typescript/package.json' assert { type: 'json' };
import { getSrcFileList } from './convert-dts/common.mjs';
import { convert } from './convert-dts/convert-main.mjs';

const srcDir = './eslint-fixed';
const distDir = '../packages';

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
      await fs.writeFile(outputFile, convert(content, filename, true));

      console.log(`${outputFile} generated.`);
    }

    {
      const outputFile = `${outputDir}/package.json`;

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(
        outputFile,
        [
          `{`,
          `  "name": "@noshiro/strict-typescript-${suffix.join('-')}",`,
          `  "version": "${typescriptPackageJson.version}",`,
          `  "private": false,`,
          `  "description": "Strict TypeScript lib",`,
          `  "repository": {`,
          `    "type": "git",`,
          `    "url": "https://github.com/noshiro-pf/mono.git"`,
          `  },`,
          `  "license": "MIT",`,
          `  "author": "noshiro-pf <noshiro.pf@gmail.com>",`,
          `  "sideEffects": false,`,
          `  "type": "module",`,
          `  "types": "./index.d.ts",`,
          `  "peerDependencies": {`,
          `    "typescript": ">=4.5.2"`,
          `  },`,
          `  "dependencies": {`,
          `    "@noshiro/ts-type-utils-no-stdlib": "*"`,
          `  }`,
          `}`,
          '',
        ].join('\n'),
      );

      console.log(`${outputFile} generated.`);
    }
  }),
);
