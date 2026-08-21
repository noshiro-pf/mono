import { Num, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { type FixedLengthTuple } from 'ts-type-forge';
import { isNumGroups, type NumGroups } from '../types/index.mjs';

export const rpParseCommand = (command: string): readonly string[] =>
  command
    .split('"')
    .filter((_, i) => i % 2 === 1)
    .map((s) => s.replaceAll(/[\n\t]/gu, ' '));

const hoursType = t.uintRange({ start: 0, end: 31, defaultValue: 0 });

export type Hours = t.TypeOf<typeof hoursType>;

export const rp3060ParseCommand = (
  commandArguments: string, // "9月4日 (土)" 15  25
  functionName: 'convertRp30ArgsToRpArgs' | 'convertRp60ArgsToRpArgs',
): Result<readonly [string, Hours, Hours], string> => {
  const regexResult =
    /\s*"(?<title>.*)"\s+"?(?<begin>[0-9]{1,2})"?\s+"?(?<end>[0-9]{1,2})"?/u.exec(
      commandArguments,
    )?.groups;

  const parseErrorMessage = [
    `error has occurred in ${functionName}:`,
    'title and begin/end hour arguments should be passed.',
  ].join('');

  if (regexResult === undefined) {
    return Result.err(parseErrorMessage);
  }

  const { title, begin, end } = regexResult;

  if (title === undefined || begin === undefined || end === undefined) {
    return Result.err(parseErrorMessage);
  }

  const arg1AsNumber = Result.unwrapOkOr(Num.safeParseInt(begin), Number.NaN);

  const arg2AsNumber = Result.unwrapOkOr(Num.safeParseInt(end), Number.NaN);

  if (!hoursType.is(arg1AsNumber) || !hoursType.is(arg2AsNumber)) {
    return Result.err(
      [
        `error has occurred in ${functionName}:`,
        'each argument should be an integer in the range 0 <= x <= 30.',
      ].join(''),
    );
  }

  return Result.ok([title, arg1AsNumber, arg2AsNumber] as const);
};

export const rp3060dParseCommand = (
  commandArguments: string, // "9月4日 (土)" 15  25
  functionName: 'convertRp30dArgsToRpArgs' | 'convertRp60dArgsToRpArgs',
): Result<FixedLengthTuple<2, Hours>, string> => {
  const regexResult =
    /\s*"?(?<begin>[0-9]{1,2})"?\s+"?(?<end>[0-9]{1,2})"?/u.exec(
      commandArguments,
    )?.groups;

  const parseErrorMessage = [
    `error has occurred in ${functionName}:`,
    'begin/end hour arguments should be passed.',
  ].join('');

  if (regexResult === undefined) {
    return Result.err(parseErrorMessage);
  }

  const { begin, end } = regexResult;

  if (begin === undefined || end === undefined) {
    return Result.err(parseErrorMessage);
  }

  const arg1AsNumber = Result.unwrapOkOr(Num.safeParseInt(begin), Number.NaN);

  const arg2AsNumber = Result.unwrapOkOr(Num.safeParseInt(end), Number.NaN);

  if (!hoursType.is(arg1AsNumber) || !hoursType.is(arg2AsNumber)) {
    return Result.err(
      [
        `error has occurred in ${functionName}:`,
        'each argument should be an integer in the range 0 <= x <= 30.',
      ].join(''),
    );
  }

  return Result.ok([arg1AsNumber, arg2AsNumber] as const);
};

export const gpParseGroupingCommandArgument = (
  commandArguments: string,
): Result<readonly [NumGroups, readonly string[]], undefined> => {
  const numGroups = Result.unwrapOkOr(
    Num.safeParseInt(commandArguments),
    Number.NaN,
  );

  if (!isNumGroups(numGroups)) return Result.err(undefined);

  return Result.ok([
    numGroups,
    commandArguments
      .split('"')
      .filter((_, i) => i % 2 === 1)
      .map((s) => s.replaceAll(/[\n\t]/gu, ' ')),
  ]);
};

export const gpParseRandCommandArgument = (
  commandArguments: string,
): Result<number, undefined> => {
  const n = Result.unwrapOkOr(Num.safeParseInt(commandArguments), Number.NaN);

  if (!Number.isSafeInteger(n) || n < 2) return Result.err(undefined);

  return Result.ok(n);
};
