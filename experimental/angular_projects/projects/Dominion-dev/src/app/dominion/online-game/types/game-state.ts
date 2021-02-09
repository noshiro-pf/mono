import { utils } from '../../../mylib/utilities';
import { getDCardsByIdArray } from '../../functions/get-dcards-by-id-array';
import { BasicCards } from './basic-cards';
import { DCard } from './dcard';
import { DCardPath } from './dcard-path';
import { KingdomCards } from './kingdom-cards';
import { PlayerCards } from './player-cards';
import { PlayerData } from './players-data';
import { TurnInfo } from './turn-info';

export class GameState {
  turnCounter: number = 0;
  numberOfPlayers: number = 0;
  Prosperity: boolean = false;
  usePotion: boolean = false;

  turnInfo: TurnInfo = new TurnInfo();
  allPlayersData: PlayerData[] = [];

  DCards: {
    allPlayersCards: PlayerCards[];
    BasicCards: BasicCards;
    KingdomCards: KingdomCards;
    trashPile: DCard[];
    BlackMarketPile: DCard[];
  } = {
    allPlayersCards: [],
    BasicCards: new BasicCards(),
    KingdomCards: new KingdomCards(),
    trashPile: [],
    BlackMarketPile: [],
  };

  constructor(dataObj?: {
    turnCounter: number;
    numberOfPlayers: number;
    Prosperity: boolean;
    usePotion: boolean;
    turnInfo: TurnInfo;
    allPlayersData: PlayerData[];
    DCards: {
      allPlayersCards: PlayerCards[];
      BasicCards: BasicCards;
      KingdomCards: KingdomCards;
      trashPile: DCard[];
      BlackMarketPile: DCard[];
    };
  }) {
    if (!dataObj) return;
    this.turnCounter = dataObj.turnCounter || 0;
    this.numberOfPlayers = dataObj.numberOfPlayers || 0;
    this.Prosperity = dataObj.Prosperity || false;
    this.usePotion = dataObj.usePotion || false;

    this.turnInfo = new TurnInfo(dataObj.turnInfo);
    this.allPlayersData = (dataObj.allPlayersData || []).map(
      (e) => new PlayerData(e)
    );
    if (!dataObj.DCards) return;
    this.DCards.allPlayersCards = (dataObj.DCards.allPlayersCards || []).map(
      (e) => new PlayerCards(e)
    );
    this.DCards.BasicCards = new BasicCards(dataObj.DCards.BasicCards);
    this.DCards.KingdomCards = new KingdomCards(dataObj.DCards.KingdomCards);
    this.DCards.trashPile = (dataObj.DCards.trashPile || []).map(
      (e) => new DCard(e)
    );
    this.DCards.BlackMarketPile = (dataObj.DCards.BlackMarketPile || []).map(
      (e) => new DCard(e)
    );
  }

  incrementTurnCounter() {
    this.turnCounter++;
  }

  setNumberOfPlayers(numberOfPlayers: number) {
    this.numberOfPlayers = numberOfPlayers;
    if (this.allPlayersData.length === 0) {
      this.allPlayersData = utils.number
        .seq0(numberOfPlayers)
        .map(() => new PlayerData());
    }
    if (this.DCards.allPlayersCards.length === 0) {
      this.DCards.allPlayersCards = utils.number
        .seq0(numberOfPlayers)
        .map(() => new PlayerCards());
    }
  }

  turnPlayerIndex() {
    return this.turnCounter % this.numberOfPlayers || 0;
  }

  nextTurnPlayerIndex() {
    return (this.turnCounter + 1) % this.numberOfPlayers || 0;
  }

  turnPlayerCards() {
    return this.DCards.allPlayersCards[this.turnPlayerIndex()];
  }

  turnPlayerData() {
    return this.allPlayersData[this.turnPlayerIndex()];
  }

  getDirectory(cardId: number): DCardPath[] {
    let result: DCardPath[] = [];
    this.DCards.allPlayersCards.forEach((playerCards, playerIndex) =>
      utils.object.forEach(playerCards, (pile: DCard[], key) => {
        if (pile.map((c) => c.id).includes(cardId)) {
          result = ['allPlayersCards', playerIndex, key] as DCardPath[];
        }
      })
    );

    utils.object.forEach(this.DCards.BasicCards, (pile: DCard[], key) => {
      if (pile.map((c) => c.id).includes(cardId)) {
        result = ['BasicCards', key] as DCardPath[];
      }
    });

    if (this.DCards.BlackMarketPile.map((c) => c.id).includes(cardId)) {
      result = ['BlackMarketPile'];
    }

    this.DCards.KingdomCards.forEach((pile, index) => {
      if (pile.map((c) => c.id).includes(cardId)) {
        result = ['KingdomCards', index];
      }
    });

    if (this.DCards.trashPile.map((c) => c.id).includes(cardId)) {
      result = ['trashPile'];
    }

    return result;
  }

  getAllPlayersCards() {
    return ([] as DCard[]).concat(
      ...this.DCards.allPlayersCards.map((pl) => pl.getDCards())
    );
  }

  getAllDCards(): DCard[] {
    return ([] as DCard[]).concat(
      this.getAllPlayersCards(),
      this.DCards.BasicCards.getDCards(),
      this.DCards.KingdomCards.getDCards(),
      this.DCards.trashPile,
      this.DCards.BlackMarketPile
    );
  }

  isEmpty() {
    return this.getAllDCards().length === 0;
  }

  getDCards(cardIdArray: number[]): DCard[] {
    return getDCardsByIdArray(cardIdArray, this.getAllDCards());
  }

  getDCard(cardId: number): DCard {
    return this.getDCards([cardId])[0] || new DCard();
  }

  removeDCards(cardIdArray: number[]) {
    this.DCards.allPlayersCards.forEach((pl) => pl.removeDCards(cardIdArray));
    this.DCards.BasicCards.removeDCards(cardIdArray);
    this.DCards.KingdomCards.removeDCards(cardIdArray);
    this.DCards.trashPile = this.DCards.trashPile.filter(
      (c) => !cardIdArray.includes(c.id)
    );
    this.DCards.BlackMarketPile = this.DCards.BlackMarketPile.filter(
      (c) => !cardIdArray.includes(c.id)
    );
  }

  emptyPiles(): number {
    const Supplies = ([] as DCard[][]).concat(
      utils.object.entries(this.DCards.BasicCards),
      this.DCards.KingdomCards
    );
    return (
      Supplies.filter((e) => e.length <= 0).length -
      (this.Prosperity ? 0 : 2) -
      (this.usePotion ? 0 : 1)
    );
  }

  gameIsOverConditions(): boolean {
    // 使用しているサプライが3山なくなったら終了
    /* [ToDo] 闇市場，廃墟などもカウント */
    return (
      this.DCards.BasicCards.Province.length <= 0 ||
      (this.Prosperity && this.DCards.BasicCards.Colony.length <= 0) ||
      this.emptyPiles() >= 3
    );
  }

  gameIsOver(): boolean {
    if (this.isEmpty()) return false;
    return this.turnInfo.phase === 'GameIsOver' && this.gameIsOverConditions();
  }

  disableAllButtons() {
    this.getAllDCards().forEach((d) =>
      d.isButton.forEach((_, i, ar) => (ar[i] = false))
    );
  }
}
