import { NumberOfVictoryCards } from '../../types/number-of-victory-cards';

export class PlayerResult {
  uid: string = ''; // databaseKey of users
  name: string = '';
  nameYomi: string = '';
  selected: boolean = false;
  VP: number = 0;
  turnOrder: number = 0;
  numberOfVictoryCards: NumberOfVictoryCards = new NumberOfVictoryCards();

  constructor(
    uid?: string,
    initObj?: {
      name: string;
      nameYomi: string;
      selected: boolean;
      VP: number;
      turnOrder: number;
      numberOfVictoryCards: NumberOfVictoryCards;
    },
  ) {
    this.uid = uid || '';
    if (!initObj) return;
    this.name = initObj.name || '';
    this.nameYomi = initObj.nameYomi || '';
    this.selected = initObj.selected || false;
    this.VP = initObj.VP || 0;
    this.turnOrder = initObj.turnOrder || 0;
    this.numberOfVictoryCards = new NumberOfVictoryCards(
      initObj.numberOfVictoryCards,
    );
  }
}
