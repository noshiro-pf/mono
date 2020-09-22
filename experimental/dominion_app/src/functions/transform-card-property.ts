import { DCardType } from '~/types/card-type'

export const dcardTypeToJpStr = (dcardType: DCardType): string => {
  switch (dcardType) {
    case 'Curse':
      return '呪い'
    case 'Action':
      return 'アクション'
    case 'Treasure':
      return '財宝'
    case 'Victory':
      return '勝利点'
    case 'Attack':
      return 'アタック'
    case 'Reaction':
      return 'リアクション'
    case 'Duration':
      return '持続'
    case 'Ruins':
      return '廃墟'
    case 'Prize':
      return '褒賞'
    case 'Looter':
      return '略奪者'
    case 'Shelter':
      return '避難所'
    case 'Knights':
      return '騎士'
    case 'Reserve':
      return 'リザーブ'
    case 'Traveller':
      return 'トラベラー'
    case 'Castle':
      return '城'
    case 'Gather':
      return '集合'
    case 'EventCards':
      return 'イベント'
    case 'LandmarkCards':
      return 'ランドマーク'
    default:
      return dcardType
  }
}

export const implementedToStr = (flag: boolean): string =>
  flag ? '実装済み' : '未実装'

export const randomizerCandidateToStr = (flag: boolean): string =>
  flag ? '〇' : '×'
