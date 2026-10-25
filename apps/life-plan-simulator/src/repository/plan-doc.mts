import { hasKey, isRecord, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { SimulationInput } from '../domain/index.mjs';

/**
 * プラン 1 件。ユーザーごとに何件でも持てる、名前の付いた入力値の組。
 * Firestore では `users/{uid}/plans/{planId}` の文書 1 つに、id を除いて
 * そのまま入れる（`firestore.rules`）。
 */
export type Plan = Readonly<{
  id: string;
  name: string;
  /** 作った時刻（ミリ秒）。一覧はこの順に並べる。 */
  createdAt: number;
  /** 最後に書き換えた時刻（ミリ秒） */
  updatedAt: number;
  input: SimulationInput;
}>;

/** プランの文書の形。書き込むときはこの形に刈り込む（`api/firestore-io.mts`）。 */
export const PlanDocCodec = t.record({
  name: t.string(''),
  createdAt: t.number(0),
  updatedAt: t.number(0),
  input: SimulationInput,
});

export type PlanDoc = t.TypeOf<typeof PlanDocCodec>;

export const planToDoc = ({
  name,
  createdAt,
  updatedAt,
  input,
}: Plan): PlanDoc => ({ name, createdAt, updatedAt, input }) as const;

/**
 * 読み込んだ文書をプランにする。名前と時刻が読めない文書は誤りとし、入力値は
 * `SimulationInput.fill` で欠けた値を既定値で補う。古い版のアプリが保存した
 * プランも、項目が増えた後でそのまま開けるようにするため。
 */
export const planFromDoc = (
  id: string,
  data: unknown,
): Result<Plan, readonly string[]> =>
  Result.map(
    Result.mapErr(PlanMetaCodec.validate(data), (errors) =>
      t.validationErrorsToMessages(errors),
    ),
    ({ name, createdAt, updatedAt }) => ({
      id,
      name,
      createdAt,
      updatedAt,
      input: SimulationInput.fill(
        isRecord(data) && hasKey(data, 'input') ? data.input : undefined,
      ),
    }),
  );

/** 入力値を除いた、文書がそのまま持っていなければならない値。 */
const PlanMetaCodec = t.record({
  name: t.string(''),
  createdAt: t.number(0),
  updatedAt: t.number(0),
});
