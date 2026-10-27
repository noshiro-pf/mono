import { map } from 'synstate';
import { Result } from 'ts-data-forge';
import {
  defaultSimulationInput,
  simulate,
  type SimulationInput,
} from '../domain/index.mjs';
import {
  parsePlanFile,
  planFileName,
  planToFileJson,
} from '../repository/index.mjs';
import { planStore } from './store.mjs';

/** 開いているプランの入力値。 */
export const input$ = planStore.input;

/** すべての計算結果。入力値が変わるたびに計算し直す。 */
export const result$ = input$.pipe(map(simulate));

/** 開いているプランの入力値の一部を書き換える。 */
export const updateSection = <K extends keyof SimulationInput>(
  key: K,
  fn: (section: SimulationInput[K]) => SimulationInput[K],
): void => {
  planStore.updateInput((input) => ({ ...input, [key]: fn(input[key]) }));
};

/**
 * 開いているプランを書き出すファイルの名前と中身。開いているプランが無ければ
 * `undefined`。
 */
export const exportCurrentPlan = ():
  Readonly<{ fileName: string; json: string }> | undefined => {
  const plan = planStore.currentPlan.getSnapshot().value;

  return plan === undefined
    ? undefined
    : { fileName: planFileName(plan.name), json: planToFileJson(plan) };
};

/**
 * プランのファイルを新しいプランとして読み込み、そのプランを開く。成功すれば
 * 既定値で補った値を返す。
 */
export const importAsNewPlan = (
  json: string,
): Result<readonly string[], string> =>
  Result.map(parsePlanFile(json), ({ name, input, warnings }) => {
    planStore.addPlan(name, input);

    return warnings;
  });

/**
 * プランのファイルの入力値で、開いているプランの入力値を置き換える（名前は
 * 変えない）。成功すれば既定値で補った値を返す。
 */
export const importIntoCurrentPlan = (
  json: string,
): Result<readonly string[], string> =>
  Result.map(parsePlanFile(json), ({ input, warnings }) => {
    planStore.updateInput(() => input);

    return warnings;
  });

/** 開いているプランの入力値を既定値に戻す。 */
export const resetInput = (): void => {
  planStore.updateInput(() => defaultSimulationInput);
};
