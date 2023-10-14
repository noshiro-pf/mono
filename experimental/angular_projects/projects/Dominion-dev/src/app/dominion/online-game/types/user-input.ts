import { utils } from '../../../mylib/utilities';
import { UserInputCommand } from './user-input-command';

export class UserInput {
  command: UserInputCommand = '';
  data: {
    playerId: number;
    shuffleBy: number[];
    autoSort: boolean;
    clickedCardId: number;
  } = {
    playerId: 0,
    shuffleBy: [],
    autoSort: true,
    clickedCardId: 0,
  };
  index: number = 0;

  constructor(
    initObj: {
      command: UserInputCommand;
      data: {
        playerId: number;
        autoSort: boolean;
        clickedCardId: number;
        shuffleBy: number[];
      };
    },
    index?: number,
  ) {
    this.command = initObj.command || '';
    this.data = {
      playerId: initObj.data.playerId,
      autoSort: initObj.data.autoSort,
      clickedCardId: 0,
      shuffleBy: initObj.data.shuffleBy || utils.number.random.permutation(200),
    };
    if (initObj.data.clickedCardId !== undefined) {
      this.data.clickedCardId = initObj.data.clickedCardId;
    }
    this.index = index || 0;
  }
}
