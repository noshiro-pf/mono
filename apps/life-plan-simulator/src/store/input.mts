import { map } from 'synstate';
import { Optional, Result } from 'ts-data-forge';
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
  const plan = Optional.unwrap(planStore.currentPlan.getSnapshot());

  return plan === undefined
    ? undefined
    : { fileName: planFileName(plan.name), json: planToFileJson(plan) };
};

/**
 * プランのファイルを新しいプランとして読み込み、そのプランを開く。成功すれば
 * 開いたプランの id と、既定値で補った値を返す。
 */
export const importAsNewPlan = (json: string): Result<ImportedFile, string> =>
  Result.map(parsePlanFile(json), ({ name, input, warnings }) => ({
    planId: planStore.addPlan(name, input),
    warnings,
  }));

/**
 * プランのファイルの入力値で、開いているプランの入力値を置き換える（名前は
 * 変えない）。成功すれば開いているプランの id と、既定値で補った値を返す。
 */
export const importIntoCurrentPlan = (
  json: string,
): Result<ImportedFile, string> =>
  Result.map(parsePlanFile(json), ({ input, warnings }) => {
    planStore.updateInput(() => input);

    return { planId: currentPlanId(), warnings };
  });

/** 読み込んだプランのファイルが入ったプランの id と、既定値で補った値。 */
export type ImportedFile = Readonly<{
  planId: string | undefined;
  warnings: readonly string[];
}>;

/** 開いているプランの id。開いているプランが無ければ `undefined`。 */
export const currentPlanId = (): string | undefined =>
  Optional.unwrap(planStore.currentPlan.getSnapshot())?.id;

/** 開いているプランの id（開いているプランが無いあいだは `undefined`）。 */
export const currentPlanId$ = planStore.currentPlan.pipe(
  map((plan) => plan?.id),
);

/** 開いているプランの入力値を既定値に戻す。 */
export const resetInput = (): void => {
  planStore.updateInput(() => defaultSimulationInput);
};
