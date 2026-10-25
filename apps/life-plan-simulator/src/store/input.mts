import { map } from 'synstate';
import { Json, Result } from 'ts-data-forge';
import {
  defaultSimulationInput,
  simulate,
  SimulationInput,
} from '../domain/index.mjs';
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
 * JSON 文字列を開いているプランの入力値として読み込む。欠けた値は既定値で
 * 補う。
 */
export const importInput = (json: string): Result<undefined, string> => {
  const parsed = Json.parse(json);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  planStore.updateInput(() => SimulationInput.fill(parsed.value));

  return Result.ok(undefined);
};

/** 開いているプランの入力値を既定値に戻す。 */
export const resetInput = (): void => {
  planStore.updateInput(() => defaultSimulationInput);
};
