import * as prettier from 'prettier';
import * as tsm from 'ts-morph';
import { monoRootAbsolutePath } from './get_mono_root_path';

const paths = {
  prettierrc: '.prettierrc',
  formatTargetDirectories: ['packages', 'scripts', 'config'],
};

const project = new tsm.Project();

const getPrettierrc = async (): Promise<prettier.Options | undefined> => {
  const prettierOptions = await prettier.resolveConfig(paths.prettierrc);
  return { ...prettierOptions, parser: 'typescript' } ?? undefined;
};

const organizeImportsAndRunPrettier = (
  sourceFiles: tsm.SourceFile[],
  prettierOptions: prettier.Options
): void => {
  sourceFiles.forEach((sourceFile) => {
    sourceFile.organizeImports();

    // run prettier
    const prettierResult = prettier.format(
      sourceFile.getFullText(),
      prettierOptions
    );

    sourceFile.replaceWithText(prettierResult);
  });
};

export async function organizeImportsAndRunPrettierWithIO(
  globPatterns: ReadonlyArray<string>
): Promise<boolean> {
  const prettierOptions = await getPrettierrc();
  if (prettierOptions === undefined) return false;

  paths.formatTargetDirectories.forEach((dir) => {
    project.addSourceFilesAtPaths(
      `${monoRootAbsolutePath}/${dir}/**/*.{ts,tsx}`
    );
  });

  const sourceFiles: tsm.SourceFile[] = project.getSourceFiles(globPatterns);

  organizeImportsAndRunPrettier(sourceFiles, prettierOptions);
  project.saveSync();

  // save updates to files
  return true;
}
