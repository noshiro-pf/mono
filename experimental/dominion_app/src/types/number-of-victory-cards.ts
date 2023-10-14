import * as I from 'immutable'
import { DCardProperty, TDCardProperty } from './dcard-property'

interface INumVictoryCards {
  VPtoken: number
  others: number

  Curse: number // -1
  Estate: number //  1
  Duchy: number //  3
  Province: number //  6
  Colony: number // 10
  Great_Hall: number //  1
  Nobles: number //  2
  Harem: number //  2
  Farmland: number //  2
  Island: number //  2
  Tunnel: number //  2
  Dame_Josephine: number //  2
  Overgrown_Estate: number //  0
  Mill: number //  1
  Cemetery: number //  2

  Gardens: number
  Duke: number // 公爵
  Vineyard: number
  Fairgrounds: number // 品評会
  Silk_Road: number
  Feodum: number // 封土
  Distant_Lands: number
  Pasture: number

  Humble_Castle: number
  Crumbling_Castle: number
  Small_Castle: number
  Haunted_Castle: number
  Opulent_Castle: number
  Sprawling_Castle: number
  Grand_Castle: number
  Kings_Castle: number

  DeckSize: number // for Gardens
  numActionCards: number // for Vineyard
  numDiffNameCards: number // for Fairgrounds
  numSilvers: number // for Feodum
  DistantLandsOnTavernMat: number // for Distant_Lands
}

const keys: (keyof INumVictoryCards)[] = [
  'VPtoken',
  'others',
  'Curse',
  'Estate',
  'Duchy',
  'Province',
  'Colony',
  'Great_Hall',
  'Nobles',
  'Harem',
  'Farmland',
  'Island',
  'Tunnel',
  'Dame_Josephine',
  'Overgrown_Estate',
  'Mill',
  'Cemetery',
  'Gardens',
  'Duke',
  'Vineyard',
  'Fairgrounds',
  'Silk_Road',
  'Feodum',
  'Distant_Lands',
  'Pasture',
  'Humble_Castle',
  'Crumbling_Castle',
  'Small_Castle',
  'Haunted_Castle',
  'Opulent_Castle',
  'Sprawling_Castle',
  'Grand_Castle',
  'Kings_Castle',
  'DeckSize',
  'numActionCards',
  'numDiffNameCards',
  'numSilvers',
  'DistantLandsOnTavernMat',
]

export type INumVictoryCardsJS = INumVictoryCards

export type TNumVictoryCards = I.Record<INumVictoryCards> &
  Readonly<INumVictoryCards>

const NumVictoryCardsRecordFactory = I.Record<INumVictoryCards>(
  keys.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {} as INumVictoryCards),
)

export const NumVictoryCards = (
  nvc?: Partial<INumVictoryCards>,
): TNumVictoryCards => NumVictoryCardsRecordFactory(nvc)

export const NumVictoryCardsFromJS = (
  nvc?: Partial<INumVictoryCardsJS>,
): TNumVictoryCards => NumVictoryCards(nvc)

export const NumVictoryCardsToJS = (
  nvc: INumVictoryCards,
): INumVictoryCardsJS =>
  keys.reduce((acc: INumVictoryCardsJS, key: string) => {
    acc[key] = nvc[key]
    return acc
  }, NumVictoryCards().toJS())

// methods

export const countCastles = (nvc: INumVictoryCards): number =>
  nvc.Humble_Castle +
  nvc.Crumbling_Castle +
  nvc.Small_Castle +
  nvc.Haunted_Castle +
  nvc.Opulent_Castle +
  nvc.Sprawling_Castle +
  nvc.Grand_Castle +
  nvc.Kings_Castle

export const countVictoryCards = (nvc: INumVictoryCards): number =>
  nvc.Estate +
  nvc.Duchy +
  nvc.Province +
  nvc.Colony +
  nvc.Great_Hall +
  nvc.Nobles +
  nvc.Harem +
  nvc.Farmland +
  nvc.Island +
  nvc.Tunnel +
  nvc.Dame_Josephine +
  nvc.Overgrown_Estate +
  nvc.Mill +
  nvc.Cemetery +
  nvc.Gardens +
  nvc.Duke +
  nvc.Vineyard +
  nvc.Fairgrounds +
  nvc.Silk_Road +
  nvc.Feodum +
  nvc.Distant_Lands +
  nvc.Pasture +
  countCastles(nvc)

export const VPtotal = (nvc: INumVictoryCards): number =>
  keys.map((key) => VPofCard(nvc, key)).reduce((acc, curr) => acc + curr)

export const VPofCard = (
  nvc: INumVictoryCards,
  name: keyof INumVictoryCards,
): number => nvc[name] * VPperCard(nvc, name)

export const VPperCard = (
  nvc: INumVictoryCards,
  name: keyof INumVictoryCards,
): number => {
  switch (name) {
    case 'VPtoken':
      return 1
    case 'others':
      return 1
    case 'Curse':
      return -1
    case 'Estate':
      return 1
    case 'Duchy':
      return 3
    case 'Province':
      return 6
    case 'Colony':
      return 10
    case 'Great_Hall':
      return 1
    case 'Nobles':
      return 2
    case 'Harem':
      return 2
    case 'Farmland':
      return 2
    case 'Island':
      return 2
    case 'Tunnel':
      return 2
    case 'Dame_Josephine':
      return 2
    case 'Overgrown_Estate':
      return 0
    case 'Mill':
      return 1
    case 'Cemetery':
      return 2

    // 庭園 : デッキ枚数 ÷ 10 点
    case 'Gardens':
      return Math.floor(nvc.DeckSize / 10)

    // 公爵 : 公領1枚につき1点
    case 'Duke':
      return nvc.Duchy

    // ブドウ園 : アクションカード3枚につき1点
    case 'Vineyard':
      return Math.floor(nvc.numActionCards / 3)

    // 品評会 : 異なる名前のカード5枚につき2勝利点
    case 'Fairgrounds':
      return 2 * Math.floor(nvc.numDiffNameCards / 5)

    // シルクロード : 勝利点カード4枚につき1点
    case 'Silk_Road':
      return Math.floor(countVictoryCards(nvc) / 4)

    // // 封土 : 銀貨3枚につき1点
    case 'Feodum':
      return Math.floor(nvc.numSilvers / 3)

    // 遠隔地 : 酒場マットの上にあれば4点，そうでなければ0点
    case 'Distant_Lands':
      return 0
    case 'DistantLandsOnTavernMat':
      return 4

    // Castles
    case 'Humble_Castle':
      return countCastles(nvc)
    case 'Crumbling_Castle':
      return 1
    case 'Small_Castle':
      return 2
    case 'Haunted_Castle':
      return 2
    case 'Opulent_Castle':
      return 3
    case 'Sprawling_Castle':
      return 4
    case 'Grand_Castle':
      return 5
    case 'Kings_Castle':
      return 2 * countCastles(nvc)

    // Pasture : 屋敷1枚につき1点
    case 'Pasture':
      return nvc.Estate

    default:
      return 0
  }
}

export const toStr = (
  nvc: INumVictoryCards,
  dcardlist: I.List<TDCardProperty>,
): string => {
  const result: string[] = []

  if (nvc.VPtoken !== 0) result.push(`VPトークン(${nvc.VPtoken})`)
  if (nvc.others !== 0) {
    result.push(`その他(${nvc.others})`)
  }

  const toNameJp = (id: string) =>
    (dcardlist.find((e) => e.cardId === id) || DCardProperty()).nameJp

  const cardIds = [
    'Curse',
    'Estate',
    'Duchy',
    'Province',
    'Colony',
    'Great_Hall',
    'Nobles',
    'Harem',
    'Farmland',
    'Island',
    'Tunnel',
    'Dame_Josephine',
    'Mill',
    'Cemetery',
    'Gardens',
    'Duke',
    'Vineyard',
    'Fairgrounds',
    'Silk_Road',
    'Feodum',
    'Distant_Lands',
    'Pasture',
  ] as (keyof INumVictoryCards)[]

  cardIds.forEach((id) => {
    if (nvc[id] !== 0) {
      result.push(`${toNameJp(id)}(${VPperCard(nvc, id)}x${nvc[id]})`)
    }
  })

  const castleCardIds = [
    'Humble_Castle',
    'Crumbling_Castle',
    'Small_Castle',
    'Haunted_Castle',
    'Opulent_Castle',
    'Sprawling_Castle',
    'Grand_Castle',
    'Kings_Castle',
  ] as (keyof INumVictoryCards)[]

  const CastleVPtotal = castleCardIds
    .map((cardId) => VPperCard(nvc, cardId) * nvc[cardId])
    .reduce((prev, curr) => prev + curr)

  if (CastleVPtotal !== 0) {
    result.push(`城(${CastleVPtotal})`)
  }

  return result.join('，')
}
