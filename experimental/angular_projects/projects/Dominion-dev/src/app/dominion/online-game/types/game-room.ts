import { utils } from '../../../mylib/utilities';
import { toListIndex } from '../../functions/to-list-index';
import { CardProperty } from '../../types/card-property';
import { SelectedCards } from '../../types/selected-cards';
import { pileSize } from '../functions/pile-size';
import { DCard } from './dcard';
import { GameState } from './game-state';
import { PlayerCards } from './player-cards';

export class GameRoom {
  // set mannually
  numberOfPlayers: number = 2;
  memo: string = '';
  isSelectedExpansions: boolean[] = [];

  // set automatically
  playerShuffler: number[] = [];
  playersNameList: string[] = [];

  databaseKey: string = '';
  gameRoomCommunicationId: string = '';
  date: Date = new Date();
  selectedCards: SelectedCards = new SelectedCards();
  initialState: GameState = new GameState();

  constructor(
    databaseKey?: string,
    dataObj?: {
      numberOfPlayers: number;
      memo: string;
      isSelectedExpansions: boolean[];
      playerShuffler: number[];
      playersNameList: Object;
      gameRoomCommunicationId: string;
      timeStamp: number;
      selectedCards: any;
      initialState: GameState;
    }
  ) {
    this.databaseKey = databaseKey || '';

    if (!dataObj) return;
    this.numberOfPlayers = dataObj.numberOfPlayers || 0;
    this.memo = dataObj.memo || '';
    this.isSelectedExpansions = dataObj.isSelectedExpansions || [];

    this.playerShuffler = dataObj.playerShuffler || [];
    this.playersNameList = utils.object.entries(dataObj.playersNameList);

    this.gameRoomCommunicationId = dataObj.gameRoomCommunicationId || '';
    this.date = new Date(dataObj.timeStamp || Date.now());
    this.selectedCards = new SelectedCards(dataObj.selectedCards);
    this.initialState = new GameState(dataObj.initialState);
  }

  playersNameShuffled() {
    return this.playersNameList.map(
      (_, i) => this.playersNameList[this.playerShuffler[i]]
    );
  }

  initCards(cardList: CardProperty[]) {
    this.initialState.Prosperity = this.selectedCards.Prosperity;

    let serialNumber = 0;

    const addCard = (cardListIndex: number, placePath: (string | number)[]) => {
      const card = new DCard();
      card.id = serialNumber++;
      card.cardProperty = cardList[cardListIndex];
      card.faceUp = utils.number.seq0(this.numberOfPlayers).map((_) => true);
      card.isButton = utils.number.seq0(this.numberOfPlayers).map((_) => false);

      let ref: any = this.initialState.DCards;
      for (let i = 0; i < placePath.length; ++i) {
        ref = ref[placePath[i]];
      }
      ref.push(card);
    };

    const addMultipleCards = (
      placePath: (string | number)[],
      cardListIndex: number
    ) => {
      const N = pileSize(
        cardList,
        cardListIndex,
        this.numberOfPlayers,
        this.selectedCards.DarkAges
      );
      for (let i = 0; i < N; ++i) {
        addCard(cardListIndex, placePath);
      }
    };

    const toCardPropIndex = (cardId: string) => toListIndex(cardList, cardId);

    // basic cards
    addMultipleCards(['BasicCards', 'Curse'], toCardPropIndex('Curse'));
    addMultipleCards(['BasicCards', 'Copper'], toCardPropIndex('Copper'));
    addMultipleCards(['BasicCards', 'Silver'], toCardPropIndex('Silver'));
    addMultipleCards(['BasicCards', 'Gold'], toCardPropIndex('Gold'));
    addMultipleCards(['BasicCards', 'Estate'], toCardPropIndex('Estate'));
    addMultipleCards(['BasicCards', 'Duchy'], toCardPropIndex('Duchy'));
    addMultipleCards(['BasicCards', 'Province'], toCardPropIndex('Province'));
    if (this.selectedCards.Prosperity) {
      addMultipleCards(['BasicCards', 'Platinum'], toCardPropIndex('Platinum'));
      addMultipleCards(['BasicCards', 'Colony'], toCardPropIndex('Colony'));
    }
    if (this.selectedCards.usePotion(cardList)) {
      addMultipleCards(['BasicCards', 'Potion'], toCardPropIndex('Potion'));
    }

    // KingdomCards

    this.selectedCards.KingdomCards10.slice(0)
      .sort((i, j) => cardList[i].cost.coin - cardList[j].cost.coin)
      .forEach((cardPropIndex, index) => {
        addMultipleCards(['KingdomCards', index], cardPropIndex);
      });
  }

  initDecks() {
    for (let index = 0; index < this.numberOfPlayers; ++index) {
      const playerCards = new PlayerCards();
      /* get 7 Coppers from supply */
      for (let i = 0; i < 7; ++i) {
        const top = this.initialState.DCards.BasicCards.Copper.pop();
        if (!!top) playerCards.Deck.push(top);
      }
      /* get 3 Estates from supply */
      for (let i = 0; i < 3; ++i) {
        const top = this.initialState.DCards.BasicCards.Estate.pop();
        if (!!top) playerCards.Deck.push(top);
      }

      playerCards.Deck.forEach((c) => (c.faceUp = c.faceUp.map((_) => false)));

      utils.number.random.shuffle(playerCards.Deck);

      for (let i = 0; i < 5; ++i) {
        const top = playerCards.Deck.pop();
        if (!!top) playerCards.HandCards.push(top);
      }

      // face up own HandCards
      playerCards.HandCards.forEach((c) => {
        c.faceUp[index] = true;
        c.isButton[index] = c.cardProperty.cardTypes.includes('Action');
      });

      playerCards.sortHandCards();

      this.initialState.DCards.allPlayersCards.push(playerCards);
    }
  }

  waitingForNewPlayers(): boolean {
    return this.playersNameList.length < this.numberOfPlayers;
  }
}
