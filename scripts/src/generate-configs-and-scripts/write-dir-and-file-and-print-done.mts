import * as fs from 'fs/promises';
import path from 'node:path';

export const writeDirAndFileAndPrintDone = async (
  dir: string,
  file: string,
  content: string,
  packageName: string,
): Promise<void> => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  const configPath = path.resolve(dir, file);
  await fs.writeFile(configPath, content);

  console.log(`[${packageName}] ${file} generated.`);
};
