import { Arr, Num, toUint32 } from '@noshiro/ts-utils';
import { ArgumentParser } from 'argparse';
import {
  auditTimeTestCases,
  combineTestCases,
  debounceTimeTestCases,
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
  setInitialValueTestCases,
  skipIfNoChangeTestCases,
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
  withCurrentValueFromTestCases,
  withIndexTestCases,
  zipTestCases,
} from './cases/index.mjs';
import { TICK } from './constants.mjs';
import { type StreamTestCase } from './typedef.mjs';

const exampleList: readonly {
  name: string;
  cases: readonly StreamTestCase<unknown>[];
}[] = [
  { name: 'auditTime', cases: auditTimeTestCases },
  { name: 'combine', cases: combineTestCases },
  { name: 'debounceTime', cases: debounceTimeTestCases },
  { name: 'filter', cases: filterTestCases },
  { name: 'fromArray', cases: fromArrayTestCases },
  { name: 'fromPromise', cases: fromPromiseTestCases },
  { name: 'interval', cases: intervalTestCases },
  { name: 'map', cases: mapTestCases },
  { name: 'mapTo', cases: mapToTestCases },
  { name: 'mapWithIndex', cases: mapWithIndexTestCases },
  { name: 'merge', cases: mergeTestCases },
  { name: 'mergeMap', cases: mergeMapTestCases },
  { name: 'pairwise', cases: pairwiseTestCases },
  { name: 'pluck', cases: pluckTestCases },
  { name: 'scan', cases: scanTestCases },
  { name: 'setInitialValue', cases: setInitialValueTestCases },
  { name: 'skip', cases: skipTestCases },
  { name: 'skipIfNoChange', cases: skipIfNoChangeTestCases },
  { name: 'skipUntil', cases: skipUntilTestCases },
  { name: 'skipWhile', cases: skipWhileTestCases },
  { name: 'switchMap', cases: switchMapTestCases },
  { name: 'take', cases: takeTestCases },
  { name: 'takeUntil', cases: takeUntilTestCases },
  { name: 'takeWhile', cases: takeWhileTestCases },
  { name: 'throttleTime', cases: throttleTimeTestCases },
  { name: 'timer', cases: timerTestCases },
  { name: 'withBufferedFrom', cases: withBufferedFromTestCases },
  { name: 'withCurrentValueFrom', cases: withCurrentValueFromTestCases },
  { name: 'withIndex', cases: withIndexTestCases },
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
  exampleIdx: NumberType.ArraySize;
  isPreviewMode: boolean;
  testCaseIdx: NumberType.ArraySize;
}> => ({
  exampleIdx: toUint32(Num.from(args.example_no[0] ?? '0') - 1),
  isPreviewMode: args.preview != null,
  testCaseIdx: toUint32(Num.from(args.case_no[0] ?? '0') - 1),
});

const getArgs = (): {
  exampleIdx: NumberType.ArraySize;
  isPreviewMode: boolean;
  testCaseIdx: NumberType.ArraySize;
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
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
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
