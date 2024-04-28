import * as fs from 'node:fs/promises';
import { getSrcFileList } from './common.mjs';
import { convert } from './convert-main.mjs';

const srcDir = './eslint-fixed';
const distDir = './final';

/** @type {boolean} */
const commentOutDeprecated = false;

const srcFileList = await getSrcFileList(srcDir);

await Promise.all(
  srcFileList.map(async ({ content, filename }) => {
    const outputFile = `${distDir}/${filename}`;

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      outputFile,
      convert(content, filename, false, commentOutDeprecated),
    );

    console.log(`${outputFile} generated.`);
  }),
);
