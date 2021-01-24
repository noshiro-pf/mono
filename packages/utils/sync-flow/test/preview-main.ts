import { ArgumentParser } from 'argparse';
import { toNumber } from '../src/util';
import { auditTimeTestCases } from './cases/audit-time';
import { combineLatestTestCases } from './cases/combine-latest';
import { debounceTimeTestCases } from './cases/debounce-time';
import { filterTestCases } from './cases/filter';
import { fromArrayTestCases } from './cases/from-array';
import { intervalTestCases } from './cases/interval';
import { mapTestCases } from './cases/map';
import { mergeTestCases } from './cases/merge';
import { throttleTimeTestCases } from './cases/throttle-time';
import { timerTestCases } from './cases/timer';
import { zipTestCases } from './cases/zip';
import { TICK } from './constants';
import { StreamTestCase } from './typedef';
import { isInRange } from './utils';

const exampleList: readonly { name: string; cases: StreamTestCase<any>[] }[] = [
  { name: 'auditTime', cases: auditTimeTestCases },
  { name: 'combineLatest', cases: combineLatestTestCases },
  { name: 'debounceTime', cases: debounceTimeTestCases },
  { name: 'filter', cases: filterTestCases },
  { name: 'fromArray', cases: fromArrayTestCases },
  { name: 'interval', cases: intervalTestCases },
  { name: 'map', cases: mapTestCases },
  { name: 'merge', cases: mergeTestCases },
  { name: 'throttleTime', cases: throttleTimeTestCases },
  { name: 'timer', cases: timerTestCases },
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
  exampleCases: StreamTestCase<any>[],
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
    required: true,
  });
  parser.addArgument(['-p', '--preview'], {
    help: 'Run in preview mode',
    nargs: 0,
    required: false,
  });
  parser.addArgument(['-c', '--case-no'], {
    help: 'Test case No.',
    nargs: 1,
    required: true,
  });

  const convertArgs = (args: {
    example_no: string[];
    preview: string[];
    case_no: string[];
  }): {
    exampleIdx: number;
    isPreviewMode: boolean;
    testCaseIdx: number;
  } => ({
    exampleIdx: (toNumber(args.example_no[0] ?? '0') ?? 0) - 1,
    isPreviewMode: args.preview != null,
    testCaseIdx: (toNumber(args.case_no[0] ?? '0') ?? 0) - 1,
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

  if (!isInRange(exampleList, exampleIdx)) {
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

  if (!isInRange(example.cases, testCaseIdx)) {
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
      .run(exampleCase.numTakeDefault, TICK.test)
      .then(console.log)
      .catch(console.error);
  }
};

main();
