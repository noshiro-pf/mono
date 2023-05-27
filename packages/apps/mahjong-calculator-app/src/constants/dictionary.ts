import { type Bakaze, type Jikaze } from '../types';
import { flagOptionsDef, maximizeTargetDef, tehaiTypeDef } from './configs';

export const dict = {
  bakaze: {
    Ton: '東',
    Nan: '南',
  } satisfies Record<Bakaze, string>,

  jikaze: {
    Ton: '東',
    Nan: '南',
    Sha: '西',
    Pei: '北',
  } satisfies Record<Jikaze, string>,

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
};
