import 'zx/globals';

export const genGlobalDts = async (
  rootDir: string,
  devDependencies: Record<string, string>,
): Promise<void> => {
  const globalUtils: readonly string[] = Object.keys(devDependencies).filter(
    (packageName) => packageName.startsWith('@noshiro/global-'),
  );

  const references: readonly string[] = globalUtils.map(
    (packageName) => `/// <reference types="${packageName}" />`,
  );

  const result = [...references, ''].join('\n');

  await fs.writeFile(`${rootDir}/src/globals.d.ts`, result);
};
