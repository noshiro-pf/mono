import { Arr, Json, Result } from 'ts-data-forge';
import packageJson from '../../package.json' with { type: 'json' };
import {
  flagOptionsDef,
  maximizeTargetDef,
  tehaiTypeDef,
  tileDef,
} from '../constants/index.mjs';
import { revealedBlockToApiPayload, toTiles34 } from '../functions/index.mjs';
import { calculatorStore } from '../store/index.mjs';
import type { ApiPayload } from '../types/index.mjs';

export const calculate = (): void => {
  calculatorStore.setIsCalculating(true);

  calculatorStore.resetResult();

  const hand = calculatorStore.handSorted.getSnapshot().value;

  const revealedBlocks = calculatorStore.revealedBlocks.getSnapshot().value;

  const turn = calculatorStore.turn.getSnapshot().value;

  const bakaze = calculatorStore.bakaze.getSnapshot().value;

  const jikaze = calculatorStore.jikaze.getSnapshot().value;

  const tehaiType = calculatorStore.tehaiType.getSnapshot().value;

  const doraIndicators = calculatorStore.doraIndicators.getSnapshot().value;

  const numRemainingTiles =
    calculatorStore.numRemainingTiles.getSnapshot().value;

  const flagOptions = calculatorStore.flagOptions.getSnapshot().value;

  const maximizeTarget = calculatorStore.maximizeTarget.getSnapshot().value;

  // cspell:disable
  const payload: ApiPayload = {
    version: packageJson.version,
    zikaze: tileDef[jikaze].no,
    bakaze: tileDef[bakaze].no,
    turn,
    syanten_type: tehaiTypeDef[tehaiType].flag,
    dora_indicators: doraIndicators.map((tileName) => tileDef[tileName].no),
    flag:
      Arr.sum([
        flagOptions.akahaiTsumo ? flagOptionsDef.akahaiTsumo.flag : 0,
        flagOptions.doubleReach ? flagOptionsDef.doubleReach.flag : 0,
        flagOptions.haitei ? flagOptionsDef.haitei.flag : 0,
        flagOptions.ippatsu ? flagOptionsDef.ippatsu.flag : 0,
        flagOptions.shantenModoshi ? flagOptionsDef.shantenModoshi.flag : 0,
        flagOptions.tegawari ? flagOptionsDef.tegawari.flag : 0,
        flagOptions.uradora ? flagOptionsDef.uradora.flag : 0,
      ]) + maximizeTargetDef[maximizeTarget].flag,
    hand_tiles: hand.map((tileName) => tileDef[tileName].no),
    melded_blocks: revealedBlocks.map(revealedBlockToApiPayload),
    counts: [
      ...toTiles34(numRemainingTiles),
      numRemainingTiles.AkaManzu5,
      numRemainingTiles.AkaPinzu5,
      numRemainingTiles.AkaSozu5,
    ],
  } as const;

  // JSON を作成する。
  // `Json.stringify` is typed `Result<string | undefined, …>`, because
  // `JSON.stringify` returns `undefined` for `undefined`, a function or a
  // symbol. `payload` is a record built above, so it is always a string.
  const requestBodyString: string =
    Result.unwrapThrow(Json.stringify(payload)) ?? '';

  const url =
    globalThis.location.hostname === 'localhost'
      ? 'http://localhost:8888'
      : '/apps/mahjong-nanikiru-simulator/post.py';

  // POST する。
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: requestBodyString,
  })
    .then((response) => response.json())
    .then((data) => {
      calculatorStore.setResult(Result.ok(data));
    })
    .catch(() => {
      calculatorStore.setResult(
        Result.err({
          type: 'fetch-error',
          message:
            'サーバーとの通信に失敗しました。サービス停止中は利用できません。',
        } as const),
      );
    })
    .finally(() => {
      calculatorStore.setIsCalculating(false);
    });
};
