import 'zx/globals';

const projectRoot = path.resolve(import.meta.dirname, '..'); // Assuming the script is in a 'scripts' directory
const srcDir = path.resolve(projectRoot, 'src');
const indexFilePath = path.resolve(srcDir, 'index.d.mts');

const generateIndexFile = async () => {
  console.log(`Searching for .d.mts files in ${srcDir}...`);

  /** @type {readonly string[]} */
  const dtsFiles = await getDtsFiles();

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

const getDtsFiles = async () => {
  const dtsFiles = await glob(`${srcDir}/**/*.d.mts`);
  return dtsFiles.filter((filePath) => filePath !== indexFilePath);
};

await generateIndexFile();
