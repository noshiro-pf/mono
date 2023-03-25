import { flagOptionsDef, maximizeTargetDef, tehaiTypeDef } from './configs';

export const apiValue = {
  // 自風
  // 手牌の種類
  tehaiType: {
    normal: tehaiTypeDef.normal.flag,
    'Chi-toi': tehaiTypeDef['Chi-toi'].flag,
    Kokushi: tehaiTypeDef.Kokushi.flag,
  },

  // 考慮項目
  flagOptions: {
    shantenModoshi: flagOptionsDef.shantenModoshi.flag,
    tegawari: flagOptionsDef.tegawari.flag,
    doubleReach: flagOptionsDef.doubleReach.flag,
    ippatsu: flagOptionsDef.ippatsu.flag,
    haitei: flagOptionsDef.haitei.flag,
    uradora: flagOptionsDef.uradora.flag,
    akahaiTsumo: flagOptionsDef.akahaiTsumo.flag,
  },

  // 最大化対象
  maximizeTarget: {
    exp: maximizeTargetDef.exp.flag,
    winProb: maximizeTargetDef.winProb.flag,
  },
} as const;
