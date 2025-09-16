export const mkdirClean = async (dir: string): Promise<void> => {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
};
