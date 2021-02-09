import { CardProperty } from './card-property';

export class SelectedCards {
  date: Date = new Date();

  Prosperity: boolean = false;
  DarkAges: boolean = false;
  KingdomCards10: number[] = [];
  BaneCard: number[] = [];
  EventCards: number[] = [];
  LandmarkCards: number[] = [];
  Obelisk: number[] = [];
  BlackMarketPile: number[] = [];

  constructor(initObj?: {
    timeStamp: number;
    Prosperity: boolean;
    DarkAges: boolean;
    KingdomCards10: number[];
    BaneCard: number[];
    EventCards: number[];
    LandmarkCards: number[];
    Obelisk: number[];
    BlackMarketPile: number[];
  }) {
    if (!initObj) return;
    this.date = new Date(initObj.timeStamp || Date.now());
    this.Prosperity = initObj.Prosperity || false;
    this.DarkAges = initObj.DarkAges || false;
    this.KingdomCards10 = initObj.KingdomCards10 || [];
    this.BaneCard = initObj.BaneCard || [];
    this.EventCards = initObj.EventCards || [];
    this.LandmarkCards = initObj.LandmarkCards || [];
    this.Obelisk = initObj.Obelisk || [];
    this.BlackMarketPile = initObj.BlackMarketPile || [];
  }

  concatAllCards(): number[] {
    return ([] as number[]).concat(
      this.KingdomCards10,
      this.BaneCard,
      this.EventCards,
      this.LandmarkCards,
      this.Obelisk,
      this.BlackMarketPile
    );
  }

  isEmpty() {
    return this.KingdomCards10.length === 0;
  }

  usePotion(cardPropertyList: CardProperty[]) {
    return this.concatAllCards().some(
      (e) => cardPropertyList[e].cost.potion > 0
    );
  }
}
