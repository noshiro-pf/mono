export class SelectedCardsCheckbox {
  KingdomCards10: boolean[] = Array(10).fill(false);
  BaneCard: boolean[] = Array(1).fill(false);
  EventCards: boolean[] = Array(2).fill(false);
  LandmarkCards: boolean[] = Array(2).fill(false);
  Obelisk: boolean[] = Array(1).fill(false);
  BlackMarketPile: boolean[] = Array(15).fill(false);

  constructor(initObj?: {
    KingdomCards10: boolean[];
    BaneCard: boolean[];
    EventCards: boolean[];
    LandmarkCards: boolean[];
    Obelisk: boolean[];
    BlackMarketPile: boolean[];
  }) {
    if (!initObj) return;
    this.KingdomCards10 = initObj.KingdomCards10 || Array(10).fill(false);
    this.BaneCard = initObj.BaneCard || Array(1).fill(false);
    this.EventCards = initObj.EventCards || Array(2).fill(false);
    this.LandmarkCards = initObj.LandmarkCards || Array(2).fill(false);
    this.Obelisk = initObj.Obelisk || Array(1).fill(false);
    this.BlackMarketPile = initObj.BlackMarketPile || Array(15).fill(false);
  }

  clear() {
    this.KingdomCards10 = Array(10).fill(false);
    this.BaneCard = Array(1).fill(false);
    this.EventCards = Array(2).fill(false);
    this.LandmarkCards = Array(2).fill(false);
    this.Obelisk = Array(1).fill(false);
    this.BlackMarketPile = Array(15).fill(false);
  }
}
