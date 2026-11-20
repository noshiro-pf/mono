import type {
  InvalidTestCase,
  RuleTester,
  RunTests,
} from '@typescript-eslint/rule-tester';
import type { TSESLint } from '@typescript-eslint/utils';
import * as path from 'node:path';
import * as ts from 'typescript';

/**
 * The type errors of each of `sources`, compiled as modules of this package
 * with its own `tsconfig.json`, in one program: the outputs of a rule's tests
 * (`recordingRun`), which no file holds.
 *
 * Each source is a virtual file under `test/`, so that it resolves
 * `ts-data-forge` and `ts-type-forge` as this package does, and is made a
 * module (`export {}`), so that the `declare const n` of one does not clash
 * with another's.
 */
export const typeErrorsOf = (
  sources: readonly string[],
): readonly (readonly string[])[] => {
  const configPath = path.join(packageRoot, 'tsconfig.json');

  const config = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        );
      },
    },
  );

  if (config === undefined) {
    throw new Error(`${configPath} could not be read`);
  }

  const files = new Map<string, string>(
    sources.map((source, index) => [
      path.join(packageRoot, 'test', `__rule-output-${index}.mts`),
      `${source}\nexport {};\n`,
    ]),
  );

  const host = ts.createCompilerHost(config.options);

  const getSourceFile = host.getSourceFile.bind(host);

  const program = ts.createProgram({
    rootNames: Array.from(files.keys()),
    // A test's code declares what it needs and uses only some of it: an unused
    // name says nothing of whether a fix compiles.
    options: {
      ...config.options,
      noEmit: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
    },
    host: {
      ...host,
      fileExists: (fileName) =>
        files.has(fileName) || host.fileExists(fileName),
      readFile: (fileName) => files.get(fileName) ?? host.readFile(fileName),
      getSourceFile: (fileName, languageVersion, ...rest) => {
        const text = files.get(fileName);

        return text === undefined
          ? getSourceFile(fileName, languageVersion, ...rest)
          : ts.createSourceFile(fileName, text, languageVersion, true);
      },
    },
  });

  return Array.from(files.keys(), (fileName) => {
    const sourceFile = program.getSourceFile(fileName);

    return sourceFile === undefined
      ? [`${fileName} was not compiled`]
      : [
          ...program.getSyntacticDiagnostics(sourceFile),
          ...program.getSemanticDiagnostics(sourceFile),
        ].map((diagnostic) => {
          const line =
            diagnostic.start === undefined
              ? 0
              : sourceFile.getLineAndCharacterOfPosition(diagnostic.start)
                  .line + 1;

          return `${line}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`;
        });
  });
};

const packageRoot = path.resolve(import.meta.dirname, '..');

/**
 * What a case of a rule's tests declares of the type check of its suggestions:
 * that their outputs compile, or that each fails to. A case that says nothing
 * has its suggestions left unchecked: a suggestion is offered where the rule
 * cannot tell, and many compile.
 */
export type TypeCheckDeclaration = Readonly<{
  typeCheck?: Readonly<{ suggestions: 'compile' | 'fail' }>;
}>;

/** The outputs of one case of a rule's tests, as `recordingRun` records them. */
export type RecordedOutputs = Readonly<{
  name: string;
  fixed: readonly string[];
  suggestions: readonly string[];
  suggestionsShould: 'compile' | 'fail' | undefined;
}>;

/**
 * `tester.run`, recording into `mut_outputs` the fixed output and the
 * suggestion outputs of each invalid case, and taking off the case's
 * `typeCheck` declaration, which `RuleTester` would read as configuration.
 */
export const recordingRun =
  (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a class instance, whose methods are not readonly
    tester: RuleTester,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- what the cases are recorded into
    mut_outputs: RecordedOutputs[],
  ) =>
  <MessageIds extends string, Options extends readonly unknown[]>(
    ruleName: string,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- passed on to `tester.run` as it is
    rule: TSESLint.RuleModule<MessageIds, Options>,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- passed on to `tester.run`
    tests: Readonly<{
      valid: RunTests<MessageIds, Options>['valid'];
      invalid: readonly (InvalidTestCase<MessageIds, Options> &
        TypeCheckDeclaration)[];
    }>,
  ): void => {
    const invalid = tests.invalid.map(({ typeCheck, ...testCase }) => {
      const output = testCase.output;

      mut_outputs.push({
        name: testCase.name ?? testCase.code,
        fixed:
          typeof output === 'string'
            ? [output]
            : Array.isArray(output)
              ? output
              : [],
        suggestions: testCase.errors.flatMap(({ suggestions }) =>
          (suggestions ?? []).flatMap(({ output: suggested }) =>
            typeof suggested === 'string' ? [suggested] : [],
          ),
        ),
        suggestionsShould: typeCheck?.suggestions,
      });

      return testCase;
    });

    tester.run(ruleName, rule, { valid: tests.valid, invalid });
  };
