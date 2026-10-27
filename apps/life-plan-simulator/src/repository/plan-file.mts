import { hasKey, isRecord, isString, Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { defaultSimulationInput, SimulationInput } from '../domain/index.mjs';

/**
 * プランを書き出したファイルの形: `{ "$schema", "name", "input" }`。
 * 「保存・読み込み」タブで書き出し、読み込む。`$schema` はアプリと一緒に
 * 公開している JSON Schema（`public/plan-file.schema.json`、`gen:schema` が
 * この型から書く）を指すので、エディタで開くと入力値の形が補完・検査される。
 */
export const PlanFile = t.record({
  $schema: t.optional(t.string('')),
  name: t.string(''),
  input: SimulationInput,
});

export type PlanFile = t.TypeOf<typeof PlanFile>;

/** 公開している `public/plan-file.schema.json` の URL。 */
export const planFileSchemaUrl =
  'https://noshiro-pf.github.io/mono/life-plan-simulator/plan-file.schema.json';

/** 読み込んだプランのファイル。 */
export type ImportedPlan = Readonly<{
  /** ファイルにあったプランの名前。空か、入力値だけのファイルなら無い。 */
  name: string | undefined;
  input: SimulationInput;
  /** 読めずに既定値で補った値。 */
  warnings: readonly string[];
}>;

export const planToFileJson = (
  plan: Readonly<{ name: string; input: SimulationInput }>,
): string =>
  `${JSON.stringify(
    {
      $schema: planFileSchemaUrl,
      name: plan.name,
      input: plan.input,
    } satisfies PlanFile,
    undefined,
    2,
  )}\n` as const;

/**
 * プランのファイルを読む。入力値は `SimulationInput.fill` で欠けた値・読めない
 * 値を既定値で補い、補った値を `warnings` で知らせる。最初の版が書き出した
 * 入力値だけのファイル（`input` の中身がそのまま一番外にある）も読める。
 */
export const parsePlanFile = (json: string): Result<ImportedPlan, string> => {
  const parsed = Json.parse(json);

  if (Result.isErr(parsed)) {
    return Result.err(`JSON として読めません（${parsed.value}）。`);
  }

  const data = parsed.value;

  if (!isRecord(data)) {
    return Result.err('プランのファイルではありません。');
  }

  const input = hasKey(data, 'input')
    ? data.input
    : Object.keys(defaultSimulationInput).some((key) => hasKey(data, key))
      ? data
      : undefined;

  if (!isRecord(input)) {
    return Result.err(
      'プランのファイルではありません（入力値 `input` がありません）。',
    );
  }

  const name =
    hasKey(data, 'input') && hasKey(data, 'name') ? data.name : undefined;

  const validated = SimulationInput.validate(input);

  return Result.ok({
    name: isString(name) && name.trim() !== '' ? name.trim() : undefined,
    input: SimulationInput.fill(input),
    warnings: Result.isOk(validated)
      ? []
      : t.validationErrorsToMessages(validated.value),
  });
};

/** 書き出すファイルの名前。プランの名前から、ファイル名に使えない文字を除く。 */
export const planFileName = (planName: string): string => {
  const base = planName.trim().replaceAll(/[\\/:*?"<>|]/gu, '_');

  return `${base === '' ? 'plan' : base}.json`;
};
