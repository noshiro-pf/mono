import * as prettier from 'prettier';
import * as tsm from 'ts-morph';
import { cwd } from './cwd';

const project = new tsm.Project({ tsConfigFilePath: `${cwd()}/tsconfig.json` });

const getPrettierrc = async (): Promise<prettier.Options | undefined> => {
  const prettierOptions = await prettier.resolveConfig('.prettierrc');
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
  globPattern: string
): Promise<void>;

export async function organizeImportsAndRunPrettierWithIO(
  globPatterns: string[]
): Promise<void>;

export async function organizeImportsAndRunPrettierWithIO(
  globPatterns: string | ReadonlyArray<string>
): Promise<void> {
  const prettierOptions = await getPrettierrc();
  if (prettierOptions === undefined) return;

  const sourceFiles: tsm.SourceFile[] =
    typeof globPatterns === 'string'
      ? project.getSourceFiles(globPatterns)
      : project.getSourceFiles(globPatterns);

  organizeImportsAndRunPrettier(sourceFiles, prettierOptions);

  // save updates to files
  project.saveSync();
}
