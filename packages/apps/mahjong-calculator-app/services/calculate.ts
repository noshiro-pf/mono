import packageJson from '../../package.json';
import {
  flagOptionsDef,
  maximizeTargetDef,
  tehaiTypeDef,
  tileDef,
} from '../constants';
import { revealedBlockToApiPayload, toTiles34 } from '../functions';
import {
  bakaze$,
  doraIndicators$,
  flagOptions$,
  handSorted$,
  jikaze$,
  maximizeTarget$,
  numRemainingTiles$,
  resetResult,
  revealedBlocks$,
  setIsCalculating,
  setResult,
  tehaiType$,
  turn$,
} from '../store';
import { type API } from '../types';

export const calculate = (): void => {
  setIsCalculating(true);
  resetResult();

  const maybeHand = handSorted$.snapshot;
  const maybeRevealedBlocks = revealedBlocks$.snapshot;
  const maybeTurn = turn$.snapshot;
  const maybeBakaze = bakaze$.snapshot;
  const maybeJikaze = jikaze$.snapshot;
  const maybeTehaiType = tehaiType$.snapshot;
  const maybeDoraIndicators = doraIndicators$.snapshot;
  const maybeNumRemainingTiles = numRemainingTiles$.snapshot;
  const maybeFlagOptions = flagOptions$.snapshot;
  const maybeMaximizeTarget = maximizeTarget$.snapshot;

  if (Maybe.isNone(maybeHand)) {
    setResult(Result.err({ type: 'hand-is-undefined', message: '' } as const));
  }

  if (Maybe.isNone(maybeRevealedBlocks)) {
    setResult(
      Result.err({ type: 'revealedBlocks-is-undefined', message: '' } as const),
    );
  }

  if (Maybe.isNone(maybeTurn)) {
    setResult(Result.err({ type: 'turn-is-undefined', message: '' } as const));
  }

  if (Maybe.isNone(maybeBakaze)) {
    setResult(
      Result.err({ type: 'bakaze-is-undefined', message: '' } as const),
    );
  }

  if (Maybe.isNone(maybeJikaze)) {
    setResult(
      Result.err({ type: 'jikaze-is-undefined', message: '' } as const),
    );
  }

  if (Maybe.isNone(maybeDoraIndicators)) {
    setResult(
      Result.err({ type: 'doraIndicators-is-undefined', message: '' } as const),
    );
  }

  if (Maybe.isNone(maybeNumRemainingTiles)) {
    setResult(
      Result.err({
        type: 'numRemainingTiles-is-undefined',
        message: '',
      } as const),
    );
  }

  if (Maybe.isNone(maybeFlagOptions)) {
    setResult(
      Result.err({
        type: 'flagOptions-is-undefined',
        message: '',
      } as const),
    );
  }

  if (Maybe.isNone(maybeMaximizeTarget)) {
    setResult(
      Result.err({
        type: 'maximizeTarget-is-undefined',
        message: '',
      } as const),
    );
  }

  if (Maybe.isNone(maybeTehaiType)) {
    setResult(
      Result.err({
        type: 'tehaiType-is-undefined',
        message: '',
      } as const),
    );
  }

  const revealedBlocks = maybeRevealedBlocks.value;
  const bakaze = maybeBakaze.value;
  const jikaze = maybeJikaze.value;
  const turn = maybeTurn.value;
  const numRemainingTiles = maybeNumRemainingTiles.value;
  const flagOptions = maybeFlagOptions.value;
  const maximizeTarget = maybeMaximizeTarget.value;
  const tehaiType = maybeTehaiType.value;
  const doraIndicators = maybeDoraIndicators.value;
  const hand = maybeHand.value;

  // cspell:disable
  const payload: API.Payload = {
    version: packageJson.version,
    zikaze: tileDef[jikaze].no,
    bakaze: tileDef[bakaze].no,
    turn,
    syanten_type: tehaiTypeDef[tehaiType].flag,
    dora_indicators: doraIndicators.map((tileName) => tileDef[tileName].no),
    flag:
      [
        flagOptions.akahaiTsumo ? flagOptionsDef.akahaiTsumo.flag : 0,
        flagOptions.doubleReach ? flagOptionsDef.doubleReach.flag : 0,
        flagOptions.haitei ? flagOptionsDef.haitei.flag : 0,
        flagOptions.ippatsu ? flagOptionsDef.ippatsu.flag : 0,
        flagOptions.shantenModoshi ? flagOptionsDef.shantenModoshi.flag : 0,
        flagOptions.tegawari ? flagOptionsDef.tegawari.flag : 0,
        flagOptions.uradora ? flagOptionsDef.uradora.flag : 0,
      ].reduce((a, x) => a + x, 0) + maximizeTargetDef[maximizeTarget].flag,
    hand_tiles: hand.map((tileName) => tileDef[tileName].no),
    melded_blocks: revealedBlocks.map(revealedBlockToApiPayload),
    counts: [
      ...toTiles34(numRemainingTiles),
      numRemainingTiles.AkaManzu5,
      numRemainingTiles.AkaPinzu5,
      numRemainingTiles.AkaSozu5,
    ],
  };

  // JSON を作成する。
  const requestBodyString: string = Result.unwrapThrow(Json.stringify(payload));

  const url =
    window.location.hostname === 'localhost'
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
      setResult(Result.ok(data as JSONValue));
    })
    .catch(() => {
      setResult(
        Result.err({
          type: 'fetch-error',
          message:
            'サーバーとの通信に失敗しました。サービス停止中は利用できません。',
        } as const),
      );
    })
    .finally(() => {
      setIsCalculating(false);
    });
};
