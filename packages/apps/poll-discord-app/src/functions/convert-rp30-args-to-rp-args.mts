import { daysOfWeekList } from '@noshiro/ts-utils-additional';
import {
  rp3060ParseCommand,
  rp3060dParseCommand,
  type Hours,
} from './parse-command.mjs';

export const convertRp60ArgToRpArgsShared = (
  title: string,
  arg1AsNumber: Hours,
  arg2AsNumber: Hours,
): Result<
  Readonly<{ title: string | undefined; args: readonly string[] }>,
  string
> => {
  const argsConverted: readonly string[] = pipe(
    Arr.range(arg1AsNumber, arg2AsNumber),
  ).chain((list) => list.map((hour) => `${hour}:00-${hour + 1}:00`)).value;

  return Result.ok({ title, args: argsConverted });
};

/** ショートカットコマンド `/rp60` の引数を /rp コマンドの引数に変換する */
export const convertRp60ArgToRpArgs = (
  commandArguments: string,
): Result<
  DeepReadonly<{
    title: string | undefined;
    args: string[];
  }>,
  string
> => {
  const res = rp3060ParseCommand(commandArguments, 'convertRp60ArgsToRpArgs');

  if (Result.isErr(res)) return res;

  const [title, arg1AsNumber, arg2AsNumber] = res.value;

  return convertRp60ArgToRpArgsShared(title, arg1AsNumber, arg2AsNumber);
};

/** ショートカットコマンド `/rp30d` の引数を /rp コマンドの引数に変換する */
export const convertRp60dArgToRpArgs = (
  commandArguments: string,
): Result<
  Readonly<{ title: string | undefined; args: readonly string[] }>,
  string
> => {
  const res = rp3060dParseCommand(commandArguments, 'convertRp30dArgsToRpArgs');

  if (Result.isErr(res)) return res;

  const [arg1AsNumber, arg2AsNumber] = res.value;

  const td = DateUtils.today();
  const title = `${DateUtils.getLocaleMonth(td)}/${DateUtils.getLocaleDate(
    td,
  )}（${daysOfWeekList.jp[DateUtils.getLocaleDayOfWeek(td)].abbr}）`;

  return convertRp60ArgToRpArgsShared(title, arg1AsNumber, arg2AsNumber);
};

export const convertRp30ArgToRpArgsShared = (
  title: string,
  arg1AsNumber: Hours,
  arg2AsNumber: Hours,
): Result<
  Readonly<{ title: string | undefined; args: readonly string[] }>,
  string
> => {
  const argsConverted: readonly string[] = pipe(
    Arr.range(arg1AsNumber, arg2AsNumber),
  ).chain((list) =>
    Arr.flatMap(list, (hour) => [
      `${hour}:00-${hour}:30`,
      `${hour}:30-${hour + 1}:00`,
    ]),
  ).value;

  return Result.ok({ title, args: argsConverted });
};

/** ショートカットコマンド `/rp30` の引数を /rp コマンドの引数に変換する */
export const convertRp30ArgToRpArgs = (
  commandArguments: string,
): Result<
  Readonly<{ title: string | undefined; args: readonly string[] }>,
  string
> => {
  const res = rp3060ParseCommand(commandArguments, 'convertRp30ArgsToRpArgs');

  if (Result.isErr(res)) return res;

  const [title, arg1AsNumber, arg2AsNumber] = res.value;

  return convertRp30ArgToRpArgsShared(title, arg1AsNumber, arg2AsNumber);
};

/** ショートカットコマンド `/rp30d` の引数を /rp コマンドの引数に変換する */
export const convertRp30dArgToRpArgs = (
  commandArguments: string,
): Result<
  Readonly<{ title: string | undefined; args: readonly string[] }>,
  string
> => {
  const res = rp3060dParseCommand(commandArguments, 'convertRp30dArgsToRpArgs');

  if (Result.isErr(res)) return res;

  const [arg1AsNumber, arg2AsNumber] = res.value;

  const td = DateUtils.today();
  const title = `${DateUtils.getLocaleMonth(td)}/${DateUtils.getLocaleDate(
    td,
  )}（${daysOfWeekList.jp[DateUtils.getLocaleDayOfWeek(td)].abbr}）`;

  return convertRp30ArgToRpArgsShared(title, arg1AsNumber, arg2AsNumber);
};
