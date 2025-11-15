export const genRootIndex = async (
  srcDir: string,
  indexFilePath: string,
): Promise<void> => {
  console.log(`Searching for .d.mts files in ${srcDir}...`);

  const dtsFiles: readonly string[] = await getDtsFiles(srcDir, indexFilePath);

  if (dtsFiles.length === 0) {
    console.log('No .d.mts files found (excluding index.d.mts).');

    // Optionally clear the index file or leave it as is
    // await fs.writeFile(indexFilePath, '', 'utf-8');
    return;
  }

  const referenceLines = dtsFiles
    .map((filePath) => {
      // Make path relative to srcDir and use forward slashes
      const relativePath = path
        .relative(srcDir, filePath)
        .replaceAll('\\', '/');

      return `/// <reference path="./${relativePath}" />`;
    })
    .toSorted(); // Sort alphabetically for consistent order

  const fileContent = `${referenceLines.join('\n')}\n`; // Add trailing newline

  try {
    await fs.writeFile(indexFilePath, fileContent, 'utf8');

    console.log(
      `Successfully generated ${indexFilePath} with ${referenceLines.length} references.`,
    );
  } catch (error) {
    console.error(`Error writing to ${indexFilePath}:`, error);
  }
};

const getDtsFiles = async (
  srcDir: string,
  indexFilePath: string,
): Promise<readonly string[]> => {
  const dtsFiles = await glob(`${srcDir}/**/*.d.mts`);

  return dtsFiles.filter((filePath) => filePath !== indexFilePath);
};
