import * as t from '@noshiro/io-ts';

import { isNumGroups, type NumGroups } from '../types';

export const rpParseCommand = (command: string): readonly string[] =>
  command
    .split('"')
    .filter((_, i) => i % 2 === 1)
    .map((s) => s.replaceAll('\n', ' ').replaceAll('\t', ' '));

const hoursType = t.uintRange({ min: 0, max: 30, defaultValue: 0 });

export const rp3060ParseCommand = (
  commandArguments: string, // "9月4日 (土)" 15  25
  functionName: 'convertRp30ArgsToRpArgs' | 'convertRp60ArgsToRpArgs'
): Result<readonly [string, number, number], string> => {
  const regexResult =
    /\s*"(?<title>.*)"\s+"?(?<begin>[0-9]{1,2})"?\s+"?(?<end>[0-9]{1,2})"?/u.exec(
      commandArguments
    )?.groups;

  const parseErrorMessage = [
    `error has occurred in ${functionName}:`,
    'title and begin/end hour arguments should be passed.',
  ].join('');

  if (isUndefined(regexResult)) {
    return Result.err(parseErrorMessage);
  }

  const { title, begin, end } = regexResult;

  if (isUndefined(title) || isUndefined(begin) || isUndefined(end)) {
    return Result.err(parseErrorMessage);
  }

  const arg1AsNumber = Num.parseInt(begin, 10);
  const arg2AsNumber = Num.parseInt(end, 10);
  if (
    arg1AsNumber === undefined ||
    arg2AsNumber === undefined ||
    !hoursType.is(arg1AsNumber) ||
    !hoursType.is(arg2AsNumber)
  ) {
    return Result.err(
      [
        `error has occurred in ${functionName}:`,
        'each argument should be an integer in the range 0 <= x <= 30.',
      ].join('')
    );
  }

  return Result.ok([title, arg1AsNumber, arg2AsNumber] as const);
};

export const rp3060dParseCommand = (
  commandArguments: string, // "9月4日 (土)" 15  25
  functionName: 'convertRp30dArgsToRpArgs' | 'convertRp60dArgsToRpArgs'
): Result<readonly [number, number], string> => {
  const regexResult =
    /\s*"?(?<begin>[0-9]{1,2})"?\s+"?(?<end>[0-9]{1,2})"?/u.exec(
      commandArguments
    )?.groups;

  const parseErrorMessage = [
    `error has occurred in ${functionName}:`,
    'begin/end hour arguments should be passed.',
  ].join('');

  if (isUndefined(regexResult)) {
    return Result.err(parseErrorMessage);
  }

  const { begin, end } = regexResult;

  if (isUndefined(begin) || isUndefined(end)) {
    return Result.err(parseErrorMessage);
  }

  const arg1AsNumber = Num.parseInt(begin, 10);
  const arg2AsNumber = Num.parseInt(end, 10);
  if (
    arg1AsNumber === undefined ||
    arg2AsNumber === undefined ||
    !hoursType.is(arg1AsNumber) ||
    !hoursType.is(arg2AsNumber)
  ) {
    return Result.err(
      [
        `error has occurred in ${functionName}:`,
        'each argument should be an integer in the range 0 <= x <= 30.',
      ].join('')
    );
  }

  return Result.ok([arg1AsNumber, arg2AsNumber] as const);
};

export const gpParseGroupingCommandArgument = (
  commandArguments: string
): Result<readonly [NumGroups, readonly string[]], undefined> => {
  const numGroups = Num.parseInt(commandArguments, 10);
  if (numGroups === undefined || !isNumGroups(numGroups))
    return Result.err(undefined);

  return Result.ok([
    numGroups,
    commandArguments
      .split('"')
      .filter((_, i) => i % 2 === 1)
      .map((s) => s.replaceAll('\n', ' ').replaceAll('\t', ' ')),
  ]);
};

export const gpParseRandCommandArgument = (
  commandArguments: string
): Result<number, undefined> => {
  const n = Num.parseInt(commandArguments, 10);
  if (n === undefined) return Result.err(undefined);
  if (n < 2 || !Num.isSafeInt(n)) return Result.err(undefined);

  return Result.ok(n);
};
