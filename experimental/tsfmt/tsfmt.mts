/* eslint-disable @typescript-eslint/class-methods-use-this */
import { castMutable, toSafeInt } from '@noshiro/ts-utils';
import * as ts from 'typescript';

// https://github.com/microsoft/TypeScript/issues/20506

class LanguageServiceHost implements ts.LanguageServiceHost {
  files: ts.MapLike<ts.IScriptSnapshot> = {};

  addFile(fileName: string, text: string): void {
    this.files[fileName] = ts.ScriptSnapshot.fromString(text);
  }

  // for ts.LanguageServiceHost

  getCompilationSettings = (): ts.CompilerOptions =>
    ts.getDefaultCompilerOptions();

  getScriptFileNames = (): string[] => castMutable(Object.keys(this.files));

  getScriptVersion = (_fileName: string): string => '0';

  getScriptSnapshot = (fileName: string): ts.IScriptSnapshot | undefined =>
    this.files[fileName];

  getCurrentDirectory = (): string => process.cwd();

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  getDefaultLibFileName = (options: ts.CompilerOptions): string =>
    ts.getDefaultLibFilePath(options);

  readFile(path: string, encoding?: string): string | undefined {
    return ts.sys.readFile(path, encoding);
  }

  fileExists(path: string): boolean {
    return ts.sys.fileExists(path);
  }
}

export const tsfmt = (
  fileName: string,
  text: string,
  options = createDefaultFormatCodeSettings(),
): string => {
  const host = new LanguageServiceHost();
  host.addFile(fileName, text);

  const languageService = ts.createLanguageService(host);
  const edits = languageService.getFormattingEditsForDocument(
    fileName,
    options,
  );
  let mut_text = text;
  for (const edit of edits
    .toSorted((a, b) => a.span.start - b.span.start)
    .toReversed()) {
    const head = text.slice(0, toSafeInt(edit.span.start));
    const tail = text.slice(toSafeInt(edit.span.start + edit.span.length));
    mut_text = `${head}${edit.newText}${tail}`;
  }

  return mut_text;
};

const createDefaultFormatCodeSettings = (): ts.FormatCodeSettings => ({
  baseIndentSize: 0,
  indentSize: 4,
  tabSize: 4,
  indentStyle: ts.IndentStyle.Smart,
  newLineCharacter: '\r\n',
  convertTabsToSpaces: true,
  insertSpaceAfterCommaDelimiter: true,
  insertSpaceAfterSemicolonInForStatements: true,
  insertSpaceBeforeAndAfterBinaryOperators: true,
  insertSpaceAfterConstructor: false,
  insertSpaceAfterKeywordsInControlFlowStatements: true,
  insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
  insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
  insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
  insertSpaceAfterTypeAssertion: false,
  insertSpaceBeforeFunctionParenthesis: false,
  placeOpenBraceOnNewLineForFunctions: false,
  placeOpenBraceOnNewLineForControlBlocks: false,
  insertSpaceBeforeTypeAnnotation: false,
});
