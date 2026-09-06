import { type ReadonlyRecord } from 'ts-type-forge';
import { type Bakaze, type Jikaze } from '../../types/index.mjs';
import {
  flagOptionsDef,
  maximizeTargetDef,
  tehaiTypeDef,
} from '../configs.mjs';

export const dict = {
  bakaze: {
    Ton: '東',
    Nan: '南',
  } satisfies ReadonlyRecord<Bakaze, string>,

  jikaze: {
    Ton: '東',
    Nan: '南',
    Sha: '西',
    Pei: '北',
  } satisfies ReadonlyRecord<Jikaze, string>,

  tehaiType: {
    normal: tehaiTypeDef.normal.displayName,
    'Chi-toi': tehaiTypeDef['Chi-toi'].displayName,
    Kokushi: tehaiTypeDef.Kokushi.displayName,
  },

  // 考慮項目
  flagOptions: {
    shantenModoshi: flagOptionsDef.shantenModoshi.displayName,
    tegawari: flagOptionsDef.tegawari.displayName,
    doubleReach: flagOptionsDef.doubleReach.displayName,
    ippatsu: flagOptionsDef.ippatsu.displayName,
    haitei: flagOptionsDef.haitei.displayName,
    uradora: flagOptionsDef.uradora.displayName,
    akahaiTsumo: flagOptionsDef.akahaiTsumo.displayName,
  },

  // 最大化対象
  maximizeTarget: {
    exp: maximizeTargetDef.exp.displayName,
    winProb: maximizeTargetDef.winProb.displayName,
  },
} as const;
