import { cardCostToStr } from '../functions/transform-card-property';

export class CardCost {
  coin: number;
  potion: number;
  debt: number;

  constructor(initObj?: { coin: number; potion: number; debt: number }) {
    this.coin = 0;
    this.potion = 0;
    this.debt = 0;
    if (!initObj) return;
    this.coin = initObj.coin || 0;
    this.potion = initObj.potion || 0;
    this.debt = initObj.debt || 0;
  }

  toStr(): string {
    return cardCostToStr(this);
  }
}

export const cmpCardCost = (cost1: CardCost, cost2: CardCost): number =>
  10000 * cost1.coin +
  100 * cost1.potion +
  cost1.debt -
  (10000 * cost2.coin + 100 * cost2.potion + cost2.debt);

// export const cardcost_gt = ( cost1: CardCost, cost2: CardCost ): boolean =>
//      cost1.coin   > cost2.coin
//   && cost1.potion > cost2.potion
//   && cost1.debt   > cost2.debt;

// export const lt = ( cost1: CardCost, cost2: CardCost ): boolean =>
//      cost1.coin   < cost2.coin
//   && cost1.potion < cost2.potion
//   && cost1.debt   < cost2.debt;

// export const eq = ( cost1: CardCost, cost2: CardCost ): boolean =>
//      cost1.coin   === cost2.coin
//   && cost1.potion === cost2.potion
//   && cost1.debt   === cost2.debt;

// export const geq = ( cost1: CardCost, cost2: CardCost ): boolean =>
//   gt( cost1, cost2 ) || eq( cost1, cost2 );

// leq( cost1: CardCost, cost2: CardCost ): boolean {
//   return this.lt( cost1, cost2 ) || this.eq( cost1, cost2 );
// }
