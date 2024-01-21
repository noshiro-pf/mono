import * as fs from 'fs/promises';
import path from 'node:path';

/**
 * @param {string} dir
 * @param {string} file
 * @param {string} packageName
 * @param {string} content
 */

export const writeDirAndFileAndPrintDone = async (
  dir,
  file,
  content,
  packageName,
) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  const configPath = path.resolve(dir, file);
  await fs.writeFile(configPath, content);

  console.log(`[${packageName}] ${file} generated.`);
};
