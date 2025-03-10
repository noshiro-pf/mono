export const getSrcFileListWithContent = async (
  srcDir: string,
): Promise<readonly Readonly<{ filename: string; content: string }>[]> => {
  const distFileNameList = await fs.readdir(srcDir);

  const distFileContentList = await Promise.all(
    distFileNameList.map((filename) =>
      fs.readFile(path.resolve(srcDir, filename), { encoding: 'utf8' }),
    ),
  );

  const distFileList: readonly Readonly<{
    filename: string;
    content: string;
  }>[] = distFileNameList.map((filename, index) => ({
    filename,
    content: distFileContentList[index] ?? '',
  }));

  return distFileList;
};

export const getSrcFileList = async (
  srcDir: string,
): Promise<readonly string[]> => fs.readdir(srcDir);
