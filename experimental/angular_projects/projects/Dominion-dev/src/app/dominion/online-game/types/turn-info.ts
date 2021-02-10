import { Phase } from './phase';

export class TurnInfo {
  action: number = 1;
  buy: number = 1;
  coin: number = 0;
  potion: number = 0;
  phase: Phase = '';
  runningCards: { cardId: string; phase: number }[] = [];

  constructor(dataObj?: {
    action: number;
    buy: number;
    coin: number;
    potion: number;
    phase: Phase;
    runningCards: { cardId: string; phase: number }[];
  }) {
    if (!dataObj) return;
    this.action = dataObj.action || 1;
    this.buy = dataObj.buy || 1;
    this.coin = dataObj.coin || 0;
    this.potion = dataObj.potion || 0;
    this.phase = dataObj.phase || '';
    this.runningCards = dataObj.runningCards || [];
  }
}
