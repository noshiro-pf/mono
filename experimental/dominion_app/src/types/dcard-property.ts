import * as I from 'immutable'
import {
  withDefault,
  withDefaultMix,
} from 'typescript-utils/functions/with-default'
import {
  dcardTypeToJpStr,
  implementedToStr,
  randomizerCandidateToStr,
} from '../functions/transform-card-property'
import {
  DCardCost,
  DCardCostToJS,
  IDCardCostJS,
  TDCardCost,
  dcardCostToStr,
} from './card-cost'
import { DCardType } from './card-type'

interface IDCardProperty {
  key: string
  index: number
  cardId: string
  nameJp: string
  nameJpYomi: string
  nameEng: string
  expansionName: I.List<string>
  category: string
  cardTypes: I.List<DCardType>
  implemented: boolean
  randomizerCandidate: boolean
  linkId: number
  imgUrl: {
    front: string
    back: string
  }
  effects: {
    cost: TDCardCost
    VP: number
    drawCard: number
    action: number
    buy: number
    coin: number
    VPtoken: number
    villager: number
    coffer: number
  }
}

export interface IDCardPropertyJS {
  key: string
  index: number
  cardId: string
  nameJp: string
  nameJpYomi: string
  nameEng: string
  expansionName: string[]
  category: string
  cardTypes: DCardType[]
  implemented: boolean
  randomizerCandidate: boolean
  linkId: number
  imgUrl: {
    front: string
    back: string
  }
  effects: {
    cost: IDCardCostJS
    VP: number
    drawCard: number
    action: number
    buy: number
    coin: number
    VPtoken: number
    villager: number
    coffer: number
  }
}

export type TDCardProperty = I.Record<IDCardProperty> & Readonly<IDCardProperty>

const DCardPropertyRecordFactory = I.Record<IDCardProperty>({
  key: '',
  index: 0,
  cardId: '',
  nameJp: '',
  nameJpYomi: '',
  nameEng: '',
  expansionName: I.List<string>(),
  category: '',
  cardTypes: I.List<DCardType>(),
  implemented: false,
  randomizerCandidate: false,
  linkId: -1,
  imgUrl: I.Record({
    front: '',
    back: '',
  })(),
  effects: I.Record({
    cost: DCardCost(),
    VP: 0,
    drawCard: 0,
    action: 0,
    buy: 0,
    coin: 0,
    VPtoken: 0,
    villager: 0,
    coffer: 0,
  })(),
})

export const DCardProperty = (dcp?: Partial<IDCardProperty>): TDCardProperty =>
  DCardPropertyRecordFactory(dcp)

export const DCardPropertyFromJS = (
  dcp?: Partial<IDCardPropertyJS>
): TDCardProperty => {
  if (dcp === undefined) return DCardProperty()
  const dfl = DCardProperty()
  const wd = withDefaultMix(dcp, dfl)
  const wdEffects = withDefault(wd('effects'), dfl.effects)
  const wdImgUrl = withDefault(wd('imgUrl'), dfl.imgUrl)
  return DCardProperty({
    key: wd('key'),
    index: wd('index'),
    cardId: wd('cardId'),
    nameJp: wd('nameJp'),
    nameJpYomi: wd('nameJpYomi'),
    nameEng: wd('nameEng'),
    expansionName: I.List(wd('expansionName')),
    category: wd('category'),
    cardTypes: I.List(wd('cardTypes')),
    implemented: wd('implemented'),
    randomizerCandidate: wd('randomizerCandidate'),
    linkId: wd('linkId'),
    imgUrl: {
      front: wdImgUrl('front'),
      back: wdImgUrl('back'),
    },
    effects: {
      VP: wdEffects('VP'),
      drawCard: wdEffects('drawCard'),
      action: wdEffects('action'),
      buy: wdEffects('buy'),
      coin: wdEffects('coin'),
      VPtoken: wdEffects('VPtoken'),
      villager: wdEffects('villager'),
      coffer: wdEffects('coffer'),
      cost: DCardCost(wdEffects('cost')),
    },
  })
}

export const DCardPropertyToJS = (dcp: TDCardProperty): IDCardPropertyJS => ({
  key: dcp.key,
  index: dcp.index,
  cardId: dcp.cardId,
  nameJp: dcp.nameJp,
  nameJpYomi: dcp.nameJpYomi,
  nameEng: dcp.nameEng,
  expansionName: dcp.expansionName.toArray(),
  category: dcp.category,
  cardTypes: dcp.cardTypes.toArray(),
  implemented: dcp.implemented,
  randomizerCandidate: dcp.randomizerCandidate,
  linkId: dcp.linkId,
  imgUrl: {
    front: '',
    back: '',
  },
  effects: {
    cost: DCardCostToJS(dcp.effects.cost),
    VP: dcp.effects.VP,
    drawCard: dcp.effects.drawCard,
    action: dcp.effects.action,
    buy: dcp.effects.buy,
    coin: dcp.effects.coin,
    VPtoken: dcp.effects.VPtoken,
    villager: dcp.effects.villager,
    coffer: dcp.effects.coffer,
  },
})

// methods

export const isWideCard = (dcp: TDCardProperty): boolean =>
  dcp.cardTypes.includes('EventCards') ||
  dcp.cardTypes.includes('LandmarkCards') ||
  dcp.cardTypes.includes('Boon') ||
  dcp.cardTypes.includes('Hex') ||
  dcp.cardTypes.includes('State') ||
  dcp.cardTypes.includes('Artifact') ||
  dcp.cardTypes.includes('Project')

export const isBasicTreasure = (dcp: TDCardProperty): boolean =>
  dcp.cardId === 'Copper' ||
  dcp.cardId === 'Silver' ||
  dcp.cardId === 'Gold' ||
  dcp.cardId === 'Platinum' ||
  dcp.cardId === 'Potion' ||
  dcp.cardId === 'Harem' ||
  dcp.cardId === 'Stash' ||
  dcp.cardId === 'Humble_Castle' ||
  dcp.cardId === 'Pasture' ||
  dcp.cardId === 'Pouch'

export const DCardPropertytoStr = (
  dcp: TDCardProperty
): I.Map<string, string> =>
  I.Map({
    index: dcp.index.toString(),
    cardId: dcp.cardId,
    nameJp: dcp.nameJp,
    nameJpYomi: dcp.nameJpYomi,
    nameEng: dcp.nameEng,
    expansionName: dcp.expansionName.join('，'),
    cost_coin: dcp.effects.cost.coin.toString(),
    cost_potion: dcp.effects.cost.potion.toString(),
    cost_debt: dcp.effects.cost.debt.toString(),
    costStr: dcardCostToStr(dcp.effects.cost),
    category: dcp.category,
    cardTypesStr: dcp.cardTypes.map(dcardTypeToJpStr).join('，'),
    cardTypes: dcp.cardTypes.toString(),
    VP: dcp.effects.VP.toString(),
    drawCard: dcp.effects.drawCard.toString(),
    action: dcp.effects.action.toString(),
    buy: dcp.effects.buy.toString(),
    coin: dcp.effects.coin.toString(),
    VPtoken: dcp.effects.VPtoken.toString(),
    coffer: dcp.effects.coffer.toString(),
    villager: dcp.effects.villager.toString(),
    implemented: implementedToStr(dcp.implemented),
    randomizerCandidate: randomizerCandidateToStr(dcp.randomizerCandidate),
  })
