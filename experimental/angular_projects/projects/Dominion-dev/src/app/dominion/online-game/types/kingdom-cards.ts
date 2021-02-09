import { getDCardsByIdArray } from '../../functions/get-dcards-by-id-array';
import { DCard } from './dcard';

export class KingdomCards extends Array<DCard[]> {
  [key: number]: any;
  0: DCard[] = [];
  1: DCard[] = [];
  2: DCard[] = [];
  3: DCard[] = [];
  4: DCard[] = [];
  5: DCard[] = [];
  6: DCard[] = [];
  7: DCard[] = [];
  8: DCard[] = [];
  9: DCard[] = [];

  constructor(kingdomCards?: Array<DCard[]>) {
    super();
    if (!kingdomCards) return;
    for (let i = 0; i < 10; ++i) {
      this[i] = (kingdomCards[i] || []).map((e) => new DCard(e));
    }
  }

  // Arrayの拡張クラスではこの記法でないとメソッドが追加されない（？）
  getDCards = (cardIdArray?: number[]): DCard[] => {
    const allDCards: DCard[] = ([] as DCard[]).concat(...this);
    return getDCardsByIdArray(cardIdArray, allDCards);
  };

  removeDCards = (cardIdArray: number[]) => {
    this.forEach(
      (pile, key, obj) =>
        (obj[key] = pile.filter((c) => !cardIdArray.includes(c.id)))
    );
  };
}
