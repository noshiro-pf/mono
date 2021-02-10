export class ChatMessage {
  [key: string]: any;
  playerName: string = '';
  content: string = '';
  command: ChatCommand = '';
  date: Date = new Date();

  constructor(initObj?: {
    playerName: string;
    content: string;
    command: ChatCommand;
    timeStamp: number;
  }) {
    if (!initObj) return;
    this.playerName = initObj.playerName || '';
    this.content = initObj.content || '';
    this.command = initObj.command || '';
    this.date = new Date(initObj.timeStamp || Date.now());
  }

  asObj(): object {
    const obj: { [key: string]: any } = {};
    Object.keys(this).forEach((key) => (obj[key] = this[key]));
    delete obj['date'];
    obj['timeStamp'] = this.date.getTime();
    return obj;
  }
}

export type ChatCommand = '' | 'leaveTheRoom';
