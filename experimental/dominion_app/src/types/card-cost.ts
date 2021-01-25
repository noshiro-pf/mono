import * as I from 'immutable'
import * as str from 'typescript-utils/functions/string'

interface IDCardCost {
  coin: number
  potion: number
  debt: number
  special: string
}

export type IDCardCostJS = IDCardCost

export type TDCardCost = I.Record<IDCardCost> & Readonly<IDCardCost>

export const DCardCost = (cost?: Partial<IDCardCost>): TDCardCost =>
  I.Record<IDCardCost>({
    coin: 0,
    potion: 0,
    debt: 0,
    special: '',
  })(cost)

export const DCardCostFromJS = (cost?: Partial<IDCardCostJS>): TDCardCost =>
  DCardCost(cost)

export const DCardCostToJS = (cost: TDCardCost): IDCardCostJS => ({
  coin: cost.coin,
  potion: cost.potion,
  debt: cost.debt,
  special: cost.special,
})

// methods

export const dcardCostToStr = (cost: TDCardCost): string => {
  const coin = cost.coin
  const potion = cost.potion
  const debt = cost.debt
  const special = cost.special

  let result = ''
  if (coin > 0 || (potion <= 0 && debt <= 0)) {
    result += coin.toString()
  }
  result += special
  if (potion > 0) {
    for (let i = 0; i < potion; ++i) result += 'P'
  }
  if (debt > 0) {
    result += `<${debt.toString()}>`
  }
  return result
}

export const cmpCardCost = (c1: TDCardCost, c2: TDCardCost): number => {
  const valueCmp =
    10000 * c1.coin +
    100 * c1.potion +
    c1.debt -
    (10000 * c2.coin + 100 * c2.potion + c2.debt)

  return valueCmp === 0 ? str.cmp(c1.special, c2.special) : valueCmp
}
