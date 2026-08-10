import { ArgumentParser } from 'argparse';
import { Arr, Num, asUint32 } from 'ts-data-forge';
import { type DeepReadonly, type SafeUint, type Uint32 } from 'ts-type-forge';
import {
  auditTestCases,
  combineTestCases,
  counterTestCases,
  debounceTestCases,
  filterTestCases,
  fromPromiseTestCases,
  mapTestCases,
  mapToTestCases,
  mergeMapTestCases,
  mergeTestCases,
  pairwiseTestCases,
  pluckTestCases,
  scanTestCases,
  skipIfNoChangeTestCases,
  skipTestCases,
  skipUntilTestCases,
  skipWhileTestCases,
  switchMapTestCases,
  takeTestCases,
  takeUntilTestCases,
  takeWhileTestCases,
  throttleTestCases,
  timerTestCases,
  withBufferedFromTestCases,
  withCurrentValueFromTestCases,
  withIndexTestCases,
  withInitialValueTestCases,
  zipTestCases,
} from './cases/index.mjs';
import { TICK } from './constants.mjs';
import { type StreamTestCase } from './typedef.mjs';

const exampleList: readonly Readonly<{
  name: string;
  cases: readonly StreamTestCase<unknown>[];
}>[] = [
  { name: 'audit', cases: auditTestCases },
  { name: 'combine', cases: combineTestCases },
  { name: 'debounce', cases: debounceTestCases },
  { name: 'filter', cases: filterTestCases },
  { name: 'fromPromise', cases: fromPromiseTestCases },
  { name: 'counter', cases: counterTestCases },
  { name: 'map', cases: mapTestCases },
  { name: 'mapTo', cases: mapToTestCases },
  { name: 'merge', cases: mergeTestCases },
  { name: 'mergeMap', cases: mergeMapTestCases },
  { name: 'pairwise', cases: pairwiseTestCases },
  { name: 'pluck', cases: pluckTestCases },
  { name: 'scan', cases: scanTestCases },
  { name: 'withInitialValue', cases: withInitialValueTestCases },
  { name: 'skip', cases: skipTestCases },
  { name: 'skipIfNoChange', cases: skipIfNoChangeTestCases },
  { name: 'skipUntil', cases: skipUntilTestCases },
  { name: 'skipWhile', cases: skipWhileTestCases },
  { name: 'switchMap', cases: switchMapTestCases },
  { name: 'take', cases: takeTestCases },
  { name: 'takeUntil', cases: takeUntilTestCases },
  { name: 'takeWhile', cases: takeWhileTestCases },
  { name: 'throttle', cases: throttleTestCases },
  { name: 'timer', cases: timerTestCases },
  { name: 'withBufferedFrom', cases: withBufferedFromTestCases },
  { name: 'withCurrentValueFrom', cases: withCurrentValueFromTestCases },
  { name: 'withIndex', cases: withIndexTestCases },
  { name: 'zip', cases: zipTestCases },
] as const;

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
    preview: string[] | undefined;
    case_no: string[];
  }>,
): Readonly<{
  exampleIdx: Uint32;
  isPreviewMode: boolean;
  testCaseIdx: Uint32;
}> =>
  ({
    exampleIdx: asUint32(Num.from(args.example_no[0] ?? '0') - 1),
    isPreviewMode: args.preview !== undefined,
    testCaseIdx: asUint32(Num.from(args.case_no[0] ?? '0') - 1),
  }) as const;

const getArgs = (): Readonly<{
  exampleIdx: Uint32;
  isPreviewMode: boolean;
  testCaseIdx: Uint32;
}> => {
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

  return convertArgs(parser.parse_args());
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
