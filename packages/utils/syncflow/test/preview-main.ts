import { indexIsInRange, stringToNumber } from '@noshiro/ts-utils';
import { ArgumentParser } from 'argparse';
import {
  auditTimeTestCases,
  combineLatestTestCases,
  debounceTimeTestCases,
  distinctUntilChangedTestCases,
  filterTestCases,
  fromArrayTestCases,
  fromPromiseTestCases,
  intervalTestCases,
  mapTestCases,
  mapToTestCases,
  mapWithIndexTestCases,
  mergeMapTestCases,
  mergeTestCases,
  pairwiseTestCases,
  pluckTestCases,
  scanTestCases,
  skipTestCases,
  skipUntilTestCases,
  skipWhileTestCases,
  switchMapTestCases,
  takeTestCases,
  takeUntilTestCases,
  takeWhileTestCases,
  throttleTimeTestCases,
  timerTestCases,
  withIndexTestCases,
  withInitialValueTestCases,
  withLatestTestCases,
  zipTestCases,
} from './cases';
import { TICK } from './constants';
import { StreamTestCase } from './typedef';

const exampleList: readonly {
  name: string;
  cases: readonly StreamTestCase<unknown>[];
}[] = [
  { name: 'auditTime', cases: auditTimeTestCases },
  { name: 'combineLatest', cases: combineLatestTestCases },
  { name: 'debounceTime', cases: debounceTimeTestCases },
  { name: 'distinctUntilChanged', cases: distinctUntilChangedTestCases },
  { name: 'filter', cases: filterTestCases },
  { name: 'fromArray', cases: fromArrayTestCases },
  { name: 'fromPromise', cases: fromPromiseTestCases },
  { name: 'interval', cases: intervalTestCases },
  { name: 'map', cases: mapTestCases },
  { name: 'mapWithIndex', cases: mapWithIndexTestCases },
  { name: 'mapTo', cases: mapToTestCases },
  { name: 'mergeMap', cases: mergeMapTestCases },
  { name: 'merge', cases: mergeTestCases },
  { name: 'pairwise', cases: pairwiseTestCases },
  { name: 'pluck', cases: pluckTestCases },
  { name: 'scan', cases: scanTestCases },
  { name: 'skip', cases: skipTestCases },
  { name: 'skipUntil', cases: skipUntilTestCases },
  { name: 'skipWhile', cases: skipWhileTestCases },
  { name: 'switchMap', cases: switchMapTestCases },
  { name: 'take', cases: takeTestCases },
  { name: 'takeUntil', cases: takeUntilTestCases },
  { name: 'takeWhile', cases: takeWhileTestCases },
  { name: 'throttleTime', cases: throttleTimeTestCases },
  { name: 'timer', cases: timerTestCases },
  { name: 'withIndex', cases: withIndexTestCases },
  { name: 'withInitialValue', cases: withInitialValueTestCases },
  { name: 'withLatest', cases: withLatestTestCases },
  { name: 'zip', cases: zipTestCases },
];

const printExamples = (exampleIdx: number): void => {
  console.log('examples:');
  exampleList.forEach((example, i) => {
    const isSelected = exampleIdx === i;
    console.log(
      `  ${isSelected ? '[' : ' '}${(i + 1)
        .toString()
        .padStart(3)}. ${example.name.padEnd(20)}${isSelected ? ']' : ' '}`
    );
  });
};

const printExampleCases = (
  exampleCases: readonly StreamTestCase<unknown>[],
  testCaseIdx: number
): void => {
  console.log('test cases:');
  exampleCases.forEach((c, i) => {
    const isSelected = testCaseIdx === i;
    console.log(
      `  ${isSelected ? '[' : ' '}${(i + 1)
        .toString()
        .padStart(3)}. ${c.name.padEnd(30)}${isSelected ? ']' : ' '}`
    );
  });
};

const printSeparator = (): void => {
  console.log('---------------------------------');
};

const printIsPreviewMode = (isPreviewMode: boolean): void => {
  console.log(`mode: ${isPreviewMode ? 'preview' : 'dump'}`);
};

const getArgs = (): {
  exampleIdx: number;
  isPreviewMode: boolean;
  testCaseIdx: number;
} => {
  const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Preview or dump stream test cases.',
  });

  parser.addArgument(['-x', '--example-no'], {
    help: 'Example No.',
    nargs: 1,
    required: false,
    defaultValue: '-1',
  });
  parser.addArgument(['-p', '--preview'], {
    help: 'Run in preview mode',
    nargs: 0,
    required: false,
  });
  parser.addArgument(['-c', '--case-no'], {
    help: 'Test case No.',
    nargs: 1,
    required: false,
    defaultValue: '-1',
  });

  const convertArgs = (
    args: Readonly<{
      example_no: readonly string[];
      preview: readonly string[];
      case_no: readonly string[];
    }>
  ): {
    exampleIdx: number;
    isPreviewMode: boolean;
    testCaseIdx: number;
  } => ({
    exampleIdx: (stringToNumber(args.example_no[0] ?? '0') ?? 0) - 1,
    isPreviewMode: args.preview != null,
    testCaseIdx: (stringToNumber(args.case_no[0] ?? '0') ?? 0) - 1,
  });

  return convertArgs(parser.parseArgs());
};

const main = (): void => {
  const { isPreviewMode, exampleIdx, testCaseIdx } = getArgs();

  console.log('');
  printIsPreviewMode(isPreviewMode);
  console.log('');
  printExamples(exampleIdx);
  console.log('');

  if (!indexIsInRange(exampleList)(exampleIdx)) {
    console.error(
      `example-no must be a value from 1 to ${exampleList.length}.`
    );
    return;
  }
  const example = exampleList[exampleIdx];
  if (example === undefined) return;

  printExampleCases(example.cases, testCaseIdx);
  console.log('');
  printSeparator();
  console.log('');

  if (!indexIsInRange(example.cases)(testCaseIdx)) {
    console.error(
      `case-no must be a value from 1 to ${example.cases.length} for this example.`
    );
    return;
  }
  const exampleCase = example.cases[testCaseIdx];
  if (exampleCase === undefined) return;

  if (isPreviewMode) {
    exampleCase.preview(TICK.preview);
  } else {
    exampleCase
      .run(exampleCase.expectedOutput.length, TICK.test)
      .then(console.log)
      .catch(console.error);
  }
};

main();
