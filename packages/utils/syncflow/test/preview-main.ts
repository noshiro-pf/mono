import { Arr, Num, toSafeUint } from '@noshiro/ts-utils';
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
  withBufferedFromTestCases,
  withIndexTestCases,
  withInitialValueTestCases,
  withLatestFromTestCases,
  zipTestCases,
} from './cases';
import { TICK } from './constants';
import { type StreamTestCase } from './typedef';

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
  { name: 'withBufferedFrom', cases: withBufferedFromTestCases },
  { name: 'withIndex', cases: withIndexTestCases },
  { name: 'withInitialValue', cases: withInitialValueTestCases },
  { name: 'withLatestFrom', cases: withLatestFromTestCases },
  { name: 'zip', cases: zipTestCases },
];

const printExamples = (exampleIdx: SafeUint): void => {
  console.log('examples:');
  for (const [i, example] of exampleList.entries()) {
    const isSelected = exampleIdx === i;
    console.log(
      `  ${isSelected ? '[' : ' '}${(i + 1)
        .toString()
        .padStart(3)}. ${example.name.padEnd(20)}${isSelected ? ']' : ' '}`,
    );
  }
};

const printExampleCases = (
  exampleCases: readonly StreamTestCase<unknown>[],
  testCaseIdx: SafeUint,
): void => {
  console.log('test cases:');
  for (const [i, c] of exampleCases.entries()) {
    const isSelected = testCaseIdx === i;
    console.log(
      `  ${isSelected ? '[' : ' '}${(i + 1)
        .toString()
        .padStart(3)}. ${c.name.padEnd(30)}${isSelected ? ']' : ' '}`,
    );
  }
};

const printSeparator = (): void => {
  console.log('---------------------------------');
};

const printMode = (isPreviewMode: boolean): void => {
  console.log(`mode: ${isPreviewMode ? 'preview' : 'dump'}`);
};

const convertArgs = (
  args: DeepReadonly<{
    example_no: string[];
    preview: string[] | null;
    case_no: string[];
  }>,
): Readonly<{
  exampleIdx: SafeUint;
  isPreviewMode: boolean;
  testCaseIdx: SafeUint;
}> => ({
  exampleIdx: toSafeUint(Num.from(args.example_no[0] ?? '0') - 1),
  isPreviewMode: args.preview != null,
  testCaseIdx: toSafeUint(Num.from(args.case_no[0] ?? '0') - 1),
});

const getArgs = (): {
  exampleIdx: SafeUint;
  isPreviewMode: boolean;
  testCaseIdx: SafeUint;
} => {
  const parser = new ArgumentParser({
    add_help: true,
    description: 'Preview or dump stream test cases.',
  });

  parser.add_argument('-x', '--example-no', {
    help: 'Specify the example No.',
    nargs: 1,
    required: false,
    default: '-1',
  });
  parser.add_argument('-c', '--case-no', {
    help: 'Test case No.',
    nargs: 1,
    required: false,
    default: '-1',
  });
  parser.add_argument('-p', '--preview', {
    help: 'Runs in preview mode.',
    action: 'store_const',
    const: true,
    required: false,
  });

  return convertArgs(
    // eslint-disable-next-line no-restricted-syntax
    parser.parse_args() as DeepReadonly<{
      example_no: string[];
      preview: string[] | null;
      case_no: string[];
    }>,
  );
};

const main = (): void => {
  const { isPreviewMode, exampleIdx, testCaseIdx } = getArgs();

  console.log('');
  printMode(isPreviewMode);
  console.log('');
  printExamples(exampleIdx);
  console.log('');

  if (!Arr.indexIsInRange(exampleList, exampleIdx)) {
    console.error(
      `example-no must be a value from 1 to ${exampleList.length}.`,
    );
    return;
  }
  const example = exampleList[exampleIdx];
  if (example === undefined) return;

  printExampleCases(example.cases, testCaseIdx);
  console.log('');
  printSeparator();
  console.log('');

  if (!Arr.indexIsInRange(example.cases, testCaseIdx)) {
    console.error(
      `case-no must be a value from 1 to ${example.cases.length} for this example.`,
    );
    return;
  }
  const exampleCase = example.cases[testCaseIdx];
  if (exampleCase === undefined) return;

  if (isPreviewMode) {
    exampleCase.preview(TICK.preview);
  } else {
    exampleCase.run(TICK.test).then(console.log).catch(console.error);
  }
};

main();
