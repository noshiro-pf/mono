import { Injectable } from '@angular/core';
import { combine, RN } from 'rnjs';
import { FireDatabaseService } from '../../database/database.service';
import { UserService } from '../../database/user.service';
import { BlackMarketPileCard } from '../types/black-market-pile-card';
import { NumberOfVictoryCards } from '../types/number-of-victory-cards';
import { SelectedCards } from '../types/selected-cards';
import { SelectedCardsCheckbox } from '../types/selected-cards-checkbox-values';
import { BlackMarketPhase } from './types/black-market-phase.enum';
import { PlayerResult } from './types/player-result';
import { RandomizerGroup } from './types/randomizer-group';

@Injectable()
export class MyRandomizerGroupService {
  private myGrpId$ = this.user.randomizerGroupId$;

  /**
   * (ToDo) listから自分のグループのみ取り出しているが，
   * idを取得後にfiredatabaseに自分のグループだけ問い合わせるように変更すべき
   */
  private myGrp$: RN<RandomizerGroup> = combine(
    this.database.randomizerGroupList$,
    this.myGrpId$
  )
    .map(
      ([list, id]) =>
        list.find((e) => e.databaseKey === id) || new RandomizerGroup()
    )
    .skipUnchanged(this.objEq);

  name$ = this.myGrp$.pluck('name').skipUnchanged();

  /**
   * myGrpのisSelectedExpansionsを取り出せば良いが，
   * 初期化されていないときにはexpansionNameListの長さのfalseの配列で初期化する必要がある．
   */
  isSelectedExpansions$: RN<boolean[]> = combine(
    this.database.expansionNameList$.map((list) => list.map((_) => false)),
    this.myGrp$.map((e) => e.isSelectedExpansions).skipUnchanged(this.objEq)
  ).map(([initArray, isSelectedExpansions]) =>
    initArray.map((_, i) => !!isSelectedExpansions[i])
  );

  selectedCardsCheckbox$: RN<SelectedCardsCheckbox> = this.myGrp$
    .pluck('selectedCardsCheckbox')
    .skipUnchanged(this.objEq);

  BlackMarketPileShuffled$: RN<BlackMarketPileCard[]> = this.myGrp$
    .pluck('BlackMarketPileShuffled')
    .skipUnchanged(this.objEq);

  BlackMarketPhase$: RN<BlackMarketPhase> = this.myGrp$
    .pluck('BlackMarketPhase')
    .skipUnchanged();

  selectedCardsHistory$: RN<SelectedCards[]> = this.myGrp$
    .pluck('selectedCardsHistory')
    .skipUnchanged(this.objEq);

  selectedIndexInHistory$: RN<number> = this.myGrp$
    .pluck('selectedIndexInHistory')
    .skipUnchanged(this.objEq);

  selectedCards$: RN<SelectedCards> = combine(
    this.selectedCardsHistory$,
    this.selectedIndexInHistory$
  ).map(([list, index]) => list[index] || new SelectedCards());

  newGameResult: {
    players$: RN<PlayerResult[]>;
    place$: RN<string>;
    memo$: RN<string>;
    lastTurnPlayerName$: RN<string>;
  } = {
    players$: this.myGrp$
      .map((e) => e.newGameResult.players)
      .skipUnchanged(this.objEq),
    place$: this.myGrp$.map((e) => e.newGameResult.place).skipUnchanged(),
    memo$: this.myGrp$.map((e) => e.newGameResult.memo).skipUnchanged(),
    lastTurnPlayerName$: this.myGrp$
      .map((e) => e.newGameResult.lastTurnPlayerName)
      .skipUnchanged(),
  };

  newGameResultDialogOpened$: RN<boolean> = this.myGrp$
    .pluck('newGameResultDialogOpened')
    .skipUnchanged();

  resetVPCalculator$: RN<number> = this.myGrp$
    .pluck('resetVPCalculator')
    .skipUnchanged();

  constructor(
    private database: FireDatabaseService,
    private user: UserService
  ) {}

  private objEq(x: any, y: any) {
    return JSON.stringify(x) === JSON.stringify(y);
  }

  async setIsSelectedExpansions(index: number, value: boolean) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.isSelectedExpansions(
      id,
      index,
      value
    );
  }

  async addToHistory(newSelectedCards: SelectedCards) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.add.selectedCardsHistory(
      id,
      newSelectedCards
    );
  }

  async setSelectedIndexInHistory(index: number) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.selectedIndexInHistory(id, index);
  }

  async setBMPileShuffled(shuffled: BlackMarketPileCard[]) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.BlackMarketPileShuffled(
      id,
      shuffled
    );
  }

  async setBlackMarketPhase(phase: number) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.BlackMarketPhase(id, phase);
  }

  async setSelectedCardsCheckbox(
    arrayName: string,
    index: number,
    value: boolean
  ) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.selectedCardsCheckbox(
      id,
      arrayName,
      index,
      value
    );
  }

  async resetSelectedCardsCheckbox() {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.reset.selectedCardsCheckbox(id);
  }

  async setNGRLastTurnPlayerName(value: string) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.newGameResult.lastTurnPlayerName(
      id,
      value
    );
  }

  async setNGRPlayerSelected(uid: string, value: boolean) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.newGameResult.players.selected(
      id,
      uid,
      value
    );
  }

  async setNGRPlayerVP(uid: string, value: number) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.newGameResult.players.VP(
      id,
      uid,
      value
    );
  }

  async setNGRPlayerNumberOfVictoryCards(
    uid: string,
    value: NumberOfVictoryCards
  ) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.newGameResult.players.numberOfVictoryCards(
      id,
      uid,
      value
    );
  }

  async setNGRPlayersTurnOrder(uid: string, value: number) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.newGameResult.players.turnOrder(
      id,
      uid,
      value
    );
  }

  async setNGRPlace(value: string) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.newGameResult.place(id, value);
  }

  async setNGRMemo(value: string) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.newGameResult.memo(id, value);
  }

  async resetVPCalculator() {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.reset.VPCalculator(id);
  }

  async setNGRDialogOpened(value: boolean) {
    const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.set.newGameResultDialogOpened(
      id,
      value
    );
  }

  async addMember(
    groupId: string,
    uid: string,
    name: string,
    nameYomi: string
  ) {
    // const id = await this.myGrpId$.once();
    const value = new PlayerResult(uid, {
      name: name,
      nameYomi: nameYomi,
      selected: false,
      VP: 0,
      turnOrder: 0,
      numberOfVictoryCards: new NumberOfVictoryCards(),
    });
    await this.database.randomizerGroup.add.member(groupId, uid, value);
  }

  async removeMember(groupId: string, uid: string) {
    // const id = await this.myGrpId$.once();
    await this.database.randomizerGroup.remove.member(groupId, uid);
  }
}
