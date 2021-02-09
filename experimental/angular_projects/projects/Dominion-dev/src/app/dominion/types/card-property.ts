import { utils } from '../../mylib/utilities';
import { CardCost } from './card-cost';
import { CardType } from './card-type';

export interface ICardProperty {
  [key: string]: any;
  indexInList: number;
  cardId: string;
  nameJp: string;
  nameJpYomi: string;
  nameEng: string;
  expansionName: string[];
  cost: CardCost;
  category: string;
  cardTypes: CardType[];
  VP: number;
  drawCard: number;
  action: number;
  buy: number;
  coin: number;
  VPtoken: number;
  implemented: boolean;
  randomizerCandidate: boolean;
  linkId: number;
}

export class CardProperty implements ICardProperty {
  [key: string]: any;

  indexInList: number = 0;
  cardId: string = '';
  nameJp: string = '';
  nameJpYomi: string = '';
  nameEng: string = '';
  expansionName: string[] = [];
  cost: CardCost = new CardCost();
  category: string = '';
  cardTypes: CardType[] = [];
  VP: number = 0;
  drawCard: number = 0;
  action: number = 0;
  buy: number = 0;
  coin: number = 0;
  VPtoken: number = 0;
  implemented: boolean = false;
  randomizerCandidate: boolean = false;
  linkId: number = -1;

  constructor(
    indexInList?: number,
    initObj?: {
      [key: string]: any;
      cardId: string;
      nameJp: string;
      nameJpYomi: string;
      nameEng: string;
      expansionName: string;
      cost: CardCost;
      category: string;
      cardTypes: string;
      VP: number;
      drawCard: number;
      action: number;
      buy: number;
      coin: number;
      VPtoken: number;
      implemented: boolean;
      randomizerCandidate: boolean;
      linkId: number;
    }
  ) {
    this.indexInList = indexInList || 0;
    if (!initObj) return;

    this.cardId = initObj.cardId || '';
    this.nameJp = initObj.nameJp || '';
    this.nameJpYomi = initObj.nameJpYomi || '';
    this.nameEng = initObj.nameEng || '';
    this.expansionName = (initObj.expansionName || '').split(',');
    this.cost = new CardCost(initObj.cost);
    this.category = initObj.category || '';
    this.cardTypes = <CardType[]>(initObj.cardTypes || '').split(',') || [];
    this.VP = initObj.VP || 0;
    this.drawCard = initObj.drawCard || 0;
    this.action = initObj.action || 0;
    this.buy = initObj.buy || 0;
    this.coin = initObj.coin || 0;
    this.VPtoken = initObj.VPtoken || 0;
    this.implemented = !!initObj.implemented;
    this.randomizerCandidate = !!initObj.randomizerCandidate;
    this.linkId = initObj.linkId || -1;
  }

  from(cardProperty: CardProperty): CardProperty {
    utils.object.forEach(
      cardProperty,
      (_, key) => (this[key] = cardProperty[key])
    );
    this.cost = new CardCost(cardProperty.cost);
    return this;
  }
}
