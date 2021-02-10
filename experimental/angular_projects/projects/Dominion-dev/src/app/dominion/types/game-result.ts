import { NumberOfVictoryCards } from './number-of-victory-cards';

export class GameResult {
  databaseKey: string = ''; // key of this game-result in fire-database
  date: number = Date.now();
  place: string = '';
  players: PlayerResultRanked[] = [];
  memo: string = '';
  selectedExpansionNameList: string[] = [];
  selectedCardsId: SelectedCardsId = new SelectedCardsId();
  lastTurnPlayerName: string = '';

  constructor(
    databaseKey?: string,
    initObj?: {
      timeStamp: number;
      place: string;
      players: PlayerResultRanked[];
      memo: string;
      selectedExpansionNameList: string[];
      selectedCardsId: SelectedCardsId;
      lastTurnPlayerName: string;
    }
  ) {
    this.databaseKey = databaseKey || '';

    if (!initObj) return;
    this.date = initObj.timeStamp || Date.now();
    this.place = initObj.place || '';
    this.players = (initObj.players || []).map(
      (e) => new PlayerResultRanked(e)
    );
    this.memo = initObj.memo || '';
    this.selectedExpansionNameList = initObj.selectedExpansionNameList || [];
    this.selectedCardsId = new SelectedCardsId(initObj.selectedCardsId);
    this.lastTurnPlayerName = initObj.lastTurnPlayerName || '';

    this.rankPlayers();
  }

  rankPlayers() {
    this.players.forEach((e) => (e.rank = 1)); // initialize ranks

    const lastTurnPlayer = this.players.find(
      (e) => e.name === this.lastTurnPlayerName
    );
    const lastTurnOrder = lastTurnPlayer ? lastTurnPlayer.turnOrder : -1;

    const isHigher = (
      playerA: PlayerResultRanked,
      playerB: PlayerResultRanked
    ) => {
      if (playerA.VP > playerB.VP) return true;
      if (playerA.VP < playerB.VP) return false;
      // 同点だがBの方がAよりターン数が多いとき
      if (
        playerB.turnOrder <= lastTurnOrder &&
        lastTurnOrder < playerA.turnOrder
      )
        return true;
      // lastTurnPlayer記録の無いデータ用
      if (lastTurnOrder < 0 && playerB.turnOrder < playerA.turnOrder)
        return true;
      return false;
    };

    for (let i = 0; i < this.players.length; i++) {
      for (let j = 0; j < this.players.length; j++) {
        // 自分よりも高順位になる要素があるごとにrank++. 等しいときは何もしない.
        if (isHigher(this.players[i], this.players[j])) this.players[j].rank++;
      }
    }

    this.players.sort((a, b) => a.rank - b.rank);
  }

  setScores(scoreTable: number[][]) {
    // 同着に対応
    const scoringTemp: number[] = Array.from(scoreTable[this.players.length]);
    const pl = this.players; // alias; players is sorted by rank
    let count = 0;
    let sum = 0.0;
    let rank = 1;
    for (let i = 0; i < pl.length; ++i) {
      count++;
      sum += scoreTable[pl.length][rank++];
      if (i === pl.length - 1 || pl[i].rank !== pl[i + 1].rank) {
        scoringTemp[pl[i].rank] = Math.round((sum * 1000) / count) / 1000;
        count = 0; // reset
        sum = 0.0; // reset
      }
    }

    // write back
    this.players.forEach((e) => {
      e.score = scoringTemp[e.rank];
    });
  }
}

class PlayerResultRanked {
  name: string = '';
  turnOrder: number = 0;
  rank: number = 0; // <- calculated locally
  score: number = 0; // <- calculated locally
  VP: number = 0; // <- calculated locally
  NofVictoryCards: NumberOfVictoryCards = new NumberOfVictoryCards();

  constructor(initObj?: {
    name: string;
    turnOrder: number;
    rank: number;
    score: number;
    VP: number;
    NofVictoryCards: NumberOfVictoryCards;
  }) {
    if (!initObj) return;
    this.name = initObj.name || '';
    this.turnOrder = initObj.turnOrder || 0;
    this.rank = initObj.rank || 0;
    this.score = initObj.score || 0;
    this.VP = initObj.VP || 0;
    this.NofVictoryCards = new NumberOfVictoryCards(initObj.NofVictoryCards);
  }
}

class SelectedCardsId {
  Prosperity: boolean = false;
  DarkAges: boolean = false;
  KingdomCards10: string[] = [];
  BaneCard: string[] = [];
  EventCards: string[] = [];
  Obelisk: string[] = [];
  LandmarkCards: string[] = [];
  BlackMarketPile: string[] = [];

  constructor(initObj?: {
    Prosperity: boolean;
    DarkAges: boolean;
    KingdomCards10: string[];
    BaneCard: string[];
    EventCards: string[];
    Obelisk: string[];
    LandmarkCards: string[];
    BlackMarketPile: string[];
  }) {
    if (!initObj) return;
    this.Prosperity = !!initObj.Prosperity;
    this.DarkAges = !!initObj.DarkAges;
    this.KingdomCards10 = initObj.KingdomCards10 || [];
    this.BaneCard = initObj.BaneCard || [];
    this.EventCards = initObj.EventCards || [];
    this.Obelisk = initObj.Obelisk || [];
    this.LandmarkCards = initObj.LandmarkCards || [];
    this.BlackMarketPile = initObj.BlackMarketPile || [];
  }
}
