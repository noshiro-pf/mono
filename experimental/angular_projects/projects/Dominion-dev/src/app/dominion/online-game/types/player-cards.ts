import { utils } from '../../../mylib/utilities';
import { getDCardsByIdArray } from '../../functions/get-dcards-by-id-array';
import { CardType } from '../../types/card-type';
import { DCard, getFiltered, initDCardArray } from './dcard';

export class PlayerCards {
  Deck: DCard[] = [];
  DiscardPile: DCard[] = [];
  HandCards: DCard[] = [];
  PlayArea: DCard[] = [];
  Aside: DCard[] = [];
  Open: DCard[] = [];

  constructor(dataObj?: {
    Deck: DCard[];
    DiscardPile: DCard[];
    HandCards: DCard[];
    PlayArea: DCard[];
    Aside: DCard[];
    Open: DCard[];
  }) {
    if (!dataObj) return;
    this.Deck = initDCardArray(dataObj.Deck);
    this.DiscardPile = initDCardArray(dataObj.DiscardPile);
    this.HandCards = initDCardArray(dataObj.HandCards);
    this.PlayArea = initDCardArray(dataObj.PlayArea);
    this.Aside = initDCardArray(dataObj.Aside);
    this.Open = initDCardArray(dataObj.Open);
  }

  sortByCardType(dcards: DCard[]): DCard[] {
    let sorted = dcards.sort(
      (a, b) => a.cardProperty.indexInList - b.cardProperty.indexInList,
    );
    let Actions, Treasures, Victories;
    const f = (type: CardType) => (d: DCard) =>
      d.cardProperty.cardTypes.includes(type);
    [Actions, sorted] = utils.array.filterRemove(sorted, f('Action'));
    [Treasures, sorted] = utils.array.filterRemove(sorted, f('Treasure'));
    [Victories, sorted] = utils.array.filterRemove(sorted, f('Victory'));
    return ([] as DCard[]).concat(Actions, Treasures, Victories, sorted);
  }

  sortHandCards() {
    this.HandCards = this.sortByCardType(this.HandCards);
  }

  getDCards(cardIdArray?: number[], sort: boolean = false): DCard[] {
    const allDCards: DCard[] = [].concat(...utils.object.entries(this));
    const dcards = getDCardsByIdArray(cardIdArray, allDCards);
    return sort ? this.sortByCardType(dcards) : dcards;
  }

  removeDCards(cardIdArray: number[]) {
    this.Deck = getFiltered(cardIdArray, this.Deck);
    this.DiscardPile = getFiltered(cardIdArray, this.DiscardPile);
    this.HandCards = getFiltered(cardIdArray, this.HandCards);
    this.PlayArea = getFiltered(cardIdArray, this.PlayArea);
    this.Aside = getFiltered(cardIdArray, this.Aside);
    this.Open = getFiltered(cardIdArray, this.Open);
  }
}
