import * as t from '@noshiro/io-ts';

import { isNumGroups, type NumGroups } from '../types';

export const rpParseCommand = (command: string): readonly string[] =>
  command
    .split('"')
    .filter((_, i) => i % 2 === 1)
    .map((s) => s.replaceAll('\n', ' ').replaceAll('\t', ' '));

const hoursType = t.uintRange({ start: 0, end: 31, defaultValue: 0 });

export type Hours = t.TypeOf<typeof hoursType>;

export const rp3060ParseCommand = (
  commandArguments: string, // "9月4日 (土)" 15  25
  functionName: 'convertRp30ArgsToRpArgs' | 'convertRp60ArgsToRpArgs'
): Result<readonly [string, Hours, Hours], string> => {
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

  const arg1AsNumber = Number.parseInt(begin, 10);
  const arg2AsNumber = Number.parseInt(end, 10);
  if (!hoursType.is(arg1AsNumber) || !hoursType.is(arg2AsNumber)) {
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
): Result<readonly [Hours, Hours], string> => {
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

  const arg1AsNumber = Number.parseInt(begin, 10);
  const arg2AsNumber = Number.parseInt(end, 10);
  if (!hoursType.is(arg1AsNumber) || !hoursType.is(arg2AsNumber)) {
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
  const numGroups = Number.parseInt(commandArguments, 10);
  if (!isNumGroups(numGroups)) return Result.err(undefined);

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
  const n = Number.parseInt(commandArguments, 10);
  if (!Number.isSafeInteger(n) || n < 2) return Result.err(undefined);

  return Result.ok(n);
};
