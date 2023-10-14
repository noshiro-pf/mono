import { BlackMarketPileCard } from '../../types/black-market-pile-card';
import { SelectedCards } from '../../types/selected-cards';
import { SelectedCardsCheckbox } from '../../types/selected-cards-checkbox-values';
import { BlackMarketPhase } from './black-market-phase.enum';
import { PlayerResult } from './player-result';

export class RandomizerGroup {
  databaseKey: string; // set only when newly created

  name: string = ''; // set only when newly created
  password: string = ''; // set only when newly created
  date: Date = new Date(); // set only when newly created

  isSelectedExpansions: boolean[] = [];
  selectedCardsCheckbox: SelectedCardsCheckbox = new SelectedCardsCheckbox();
  BlackMarketPileShuffled: BlackMarketPileCard[] = [];
  BlackMarketPhase: number = BlackMarketPhase.init;
  selectedCardsHistory: SelectedCards[] = [];
  selectedIndexInHistory: number = 0;

  newGameResult: {
    players: PlayerResult[];
    place: string;
    memo: string;
    lastTurnPlayerName: string;
  } = {
    players: [],
    place: '',
    memo: '',
    lastTurnPlayerName: '',
  };

  newGameResultDialogOpened: boolean = false;
  resetVPCalculator: number = 0;

  constructor(
    databaseKey?: string,
    initObj?: {
      name: string;
      password: string;
      timeStamp: number;

      isSelectedExpansions: boolean[];
      selectedCardsCheckbox: SelectedCardsCheckbox;
      BlackMarketPileShuffled: BlackMarketPileCard[];
      BlackMarketPhase: number;
      selectedCardsHistory: object[];
      selectedIndexInHistory: number;

      newGameResult: {
        players: object;
        place: string;
        memo: string;
        lastTurnPlayerName: string;
      };

      newGameResultDialogOpened: boolean;
      resetVPCalculator: number;
    },
  ) {
    this.databaseKey = databaseKey || '';

    if (!initObj) return;
    this.name = initObj.name || '';
    this.password = initObj.password || '';
    this.date = new Date(initObj.timeStamp || Date.now());

    this.isSelectedExpansions = initObj.isSelectedExpansions || [];
    this.selectedCardsCheckbox = new SelectedCardsCheckbox(
      initObj.selectedCardsCheckbox,
    );
    this.BlackMarketPileShuffled = initObj.BlackMarketPileShuffled || [];
    this.BlackMarketPhase = initObj.BlackMarketPhase || BlackMarketPhase.init;
    this.selectedIndexInHistory = initObj.selectedIndexInHistory || 0;
    this.selectedCardsHistory = entries(initObj.selectedCardsHistory)
      .sort((a, b) => b.value.timeStamp - a.value.timeStamp) // 時刻の降順にソート
      .map((e) => new SelectedCards(e.value));

    if (!!initObj.newGameResult) {
      this.newGameResult.players = entries(initObj.newGameResult.players)
        .map((e) => new PlayerResult(e.key, e.value))
        .sort((a, b) => a.nameYomi.localeCompare(b.nameYomi));
      this.newGameResult.place = initObj.newGameResult.place || '';
      this.newGameResult.memo = initObj.newGameResult.memo || '';
      this.newGameResult.lastTurnPlayerName =
        initObj.newGameResult.lastTurnPlayerName || '';
    }
    this.newGameResultDialogOpened = !!initObj.newGameResultDialogOpened;
    this.resetVPCalculator = initObj.resetVPCalculator || 0;
  }
}

function entries(obj: any): { key: string; value: any }[] {
  if (!obj) return [];
  return Object.keys(obj).map((key) => ({ key: key, value: obj[key] }));
}
