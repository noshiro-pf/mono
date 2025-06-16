import { projectRootPath } from '../project-root-path.mjs';

const srcDir = path.resolve(projectRootPath, 'src');
const indexFilePath = path.resolve(srcDir, 'index.d.mts');

const genRootIndex = async (): Promise<void> => {
  console.log(`Searching for .d.mts files in ${srcDir}...`);

  const dtsFiles: readonly string[] = await getDtsFiles();

  if (dtsFiles.length === 0) {
    console.log('No .d.mts files found (excluding index.d.mts).');
    // Optionally clear the index file or leave it as is
    // await fs.writeFile(indexFilePath, '', 'utf-8');
    return;
  }

  const referenceLines = dtsFiles
    .map((filePath) => {
      // Make path relative to srcDir and use forward slashes
      const relativePath = path.relative(srcDir, filePath).replace(/\\/gu, '/');
      return `/// <reference path="./${relativePath}" />`;
    })
    .toSorted(); // Sort alphabetically for consistent order

  const fileContent = `${referenceLines.join('\n')}\n`; // Add trailing newline

  try {
    await fs.writeFile(indexFilePath, fileContent, 'utf-8');
    console.log(
      `Successfully generated ${indexFilePath} with ${referenceLines.length} references.`,
    );
  } catch (err) {
    console.error(`Error writing to ${indexFilePath}:`, err);
  }
};

const getDtsFiles = async (): Promise<readonly string[]> => {
  const dtsFiles = await glob(`${srcDir}/**/*.d.mts`);
  return dtsFiles.filter((filePath) => filePath !== indexFilePath);
};

await genRootIndex();
