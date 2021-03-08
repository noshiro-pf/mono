import { utils } from '../mylib/utilities';

export class Schedule {
  databaseKey: string = '';
  title: string = '';
  notes: string = '';
  selectedDatetimes: number[] = [];
  answerDeadline: number = Date.now();
  symbols: ScheduleSymbol[] = [];
  answers: Answer[] = [];
  password: string = '';

  constructor(
    databaseKey?: string,
    initObj?: {
      title: string;
      notes: string;
      selectedDatetimes: number[];
      answerDeadline: number;
      symbols: ScheduleSymbol[];
      answers: Answer[];
      password: string;
    }
  ) {
    this.databaseKey = databaseKey || '';

    if (!initObj) return;
    this.title = initObj.title || '';
    this.notes = initObj.notes || '';
    this.selectedDatetimes = (initObj.selectedDatetimes || []).slice();
    this.answerDeadline = initObj.answerDeadline || Date.now();
    this.symbols = initObj.symbols || [];
    this.answers =
      utils.object
        .entries(initObj.answers)
        .map((e) => new Answer(e.key, e.value)) || [];
    this.password = initObj.password || '';
  }
}

export interface ScheduleSymbol {
  id: string;
  useThis: boolean;
  iconName: string;
  description: string;
  score: number;
}

export class Answer {
  databaseKey: string = '';
  userName: string = ''; /* 回答者名 */
  comment: string = '';
  selection: { date: number; symbolID: string }[] = [];

  constructor(
    databaseKey?: string,
    initObj?: {
      userName: string;
      comment: string;
      selection: { date: number; symbolID: string }[];
    }
  ) {
    this.databaseKey = databaseKey || '';

    if (!initObj) return;
    this.userName = initObj.userName || '';
    this.comment = initObj.comment || '';
    this.selection = initObj.selection || [];
  }
}
