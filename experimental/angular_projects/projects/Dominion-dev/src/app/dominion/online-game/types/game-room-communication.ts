import { ChatMessage } from './chat-message';
import { UserInput } from './user-input';

export class GameCommunication {
  databaseKey: string = '';

  chatList: ChatMessage[] = [];
  userInputList: UserInput[] = [];
  resetGameClicked: number = 0;
  thinkingState: boolean[] = [];
  presenceState: boolean[] = [];
  isTerminated: boolean = false;
  resultIsSubmitted: boolean = false;

  constructor(
    databaseKey?: string,
    dataObj?: {
      chatList: ChatMessage[];
      userInputList: UserInput[];
      resetGameClicked: number;
      thinkingState: boolean[];
      presenceState: boolean[];
      isTerminated: boolean;
      resultIsSubmitted: boolean;
    }
  ) {
    this.databaseKey = databaseKey || '';

    if (!dataObj) return;
    this.chatList = dataObj.chatList || [];
    this.userInputList = dataObj.userInputList || [];
    this.resetGameClicked = dataObj.resetGameClicked || 0;
    this.thinkingState = dataObj.thinkingState || [];
    this.presenceState = dataObj.presenceState || [];
    this.isTerminated = !!dataObj.isTerminated;
    this.resultIsSubmitted = !!dataObj.resultIsSubmitted;
  }
}
