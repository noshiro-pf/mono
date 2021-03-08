import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MatSidenav } from '@angular/material/sidenav';
import { combine, RN } from 'rnjs';
import { FireDatabaseService } from '../../../database/database.service';
import { UserService } from '../../../database/user.service';
import { utils } from '../../../mylib/utilities';
import { SelectedCardsCheckbox } from '../../types/selected-cards-checkbox-values';
import { MyRandomizerGroupService } from '../my-randomizer-group.service';
import { BlackMarketPhase } from '../types/black-market-phase.enum';
import { RandomizerGroup } from '../types/randomizer-group';

@Component({
  selector: 'app-randomizer-group-list',
  templateUrl: './randomizer-group-list.component.html',
  styleUrls: ['./randomizer-group-list.component.css'],
})
export class RandomizerGroupListComponent implements OnInit {
  @Input() private sidenav!: MatSidenav;

  uid$: RN<string> = this.user.uid$;
  myName$: RN<string> = this.user.name$;
  myNameYomi$: RN<string> = this.user.nameYomi$;

  randomizerGroupListWithUsers$: RN<
    { group: RandomizerGroup; users: string[] }[]
  > = combine(this.database.randomizerGroupList$, this.database.users$).map(
    ([randomizerGroupList, users]) =>
      randomizerGroupList.map((group) => ({
        group: group,
        users: users
          .filter((user) => user.randomizerGroupId === group.databaseKey)
          .map((user) => user.name),
      }))
  );

  newGroupName!: string;
  newGroupPassword!: string;
  signInPassword!: string;
  showWrongPasswordAlert = false;
  selectedGroupId = '';

  constructor(
    public snackBar: MatSnackBar,
    private user: UserService,
    private database: FireDatabaseService,
    private myRandomizerGroup: MyRandomizerGroupService
  ) {}

  ngOnInit() {}

  /* sidenav */
  closeSideNav() {
    this.resetSignInForm();
    this.resetAddGroupForm();
    this.sidenav.close();
  }

  backgroundClicked() {
    this.resetSignInForm();
    this.selectedGroupId = '';
  }

  /* 新規グループ */
  newGroupNameOnChange(value: string) {
    this.newGroupName = value;
  }

  newGroupPasswordOnChange(value: string) {
    this.newGroupPassword = value;
  }

  async addRandomizerGroup(
    uid: string,
    myName: string,
    myNameYomi: string,
    groupListWithUsers: { group: RandomizerGroup; users: string[] }[]
  ) {
    const expansionNameList = await this.database.expansionNameList$.once();
    const isSelectedExpansionsInit = expansionNameList.map((_) => true);

    const newRandomizerGroup = new RandomizerGroup(undefined, {
      name: this.newGroupName,
      password: this.newGroupPassword,
      timeStamp: Date.now(),
      isSelectedExpansions: isSelectedExpansionsInit,
      selectedCardsCheckbox: new SelectedCardsCheckbox(),
      BlackMarketPileShuffled: [],
      BlackMarketPhase: BlackMarketPhase.init,
      selectedCardsHistory: [],
      selectedIndexInHistory: 0,
      newGameResult: {
        players: {},
        place: '',
        memo: '',
        lastTurnPlayerName: '',
      },
      newGameResultDialogOpened: false,
      resetVPCalculator: 0,
    });

    const ref = await this.database.randomizerGroup.addGroup(
      newRandomizerGroup
    );
    const groupId = ref.key;
    await this.user.setRandomizerGroupId(groupId);
    await this.myRandomizerGroup.addMember(groupId, uid, myName, myNameYomi);
    // await this.removeMemberEmptyGroup();
    this.resetAddGroupForm();

    this.openSnackBar('Successfully signed in!');
    this.sidenav.close();
  }

  /* グループ選択 */
  groupClicked($event: any, groupId: string) {
    this.resetSignInForm();
    this.selectedGroupId = groupId;
    $event.stopPropagation();
  }

  toYMDHMS(date: Date) {
    return utils.date.toYMDHMS(date);
  }

  signInPasswordOnChange(value: string) {
    this.signInPassword = value;
  }

  async signIn(
    groupId: string,
    uid: string,
    myName: string,
    myNameYomi: string,
    groupListWithUsers: { group: RandomizerGroup; users: string[] }[]
  ) {
    if (!this.signInPasswordIsValid(groupId, groupListWithUsers)) return;

    this.resetSignInForm();
    await Promise.all([
      this.user.setRandomizerGroupId(groupId),
      this.myRandomizerGroup.addMember(groupId, uid, myName, myNameYomi),
    ]);

    this.openSnackBar('Successfully signed in!');
    this.sidenav.close();
    // await this.removeMemberEmptyGroup();
  }

  async signOut(
    groupId: string,
    uid: string,
    groupListWithUsers: { group: RandomizerGroup; users: string[] }[]
  ) {
    if (!this.signInPasswordIsValid(groupId, groupListWithUsers)) return;

    this.resetSignInForm();
    await Promise.all([
      this.myRandomizerGroup.removeMember(groupId, uid),
      this.user.setRandomizerGroupId(''),
    ]);

    this.openSnackBar('Successfully signed out!');
    this.sidenav.close();
    // await this.removeMemberEmptyGroup();
  }

  /* private methods */
  private signInPasswordIsValid(
    groupId: string,
    groupListWithUsers: { group: RandomizerGroup; users: string[] }[]
  ): boolean {
    const group = (
      groupListWithUsers.find((g) => g.group.databaseKey === groupId) || {
        group: new RandomizerGroup(),
      }
    ).group;
    const isValid = !group.password || this.signInPassword === group.password;
    this.showWrongPasswordAlert = !isValid;
    return isValid;
  }

  // private async removeMemberEmptyGroup(
  //   // groupListWithUsers: { group: RandomizerGroup, users: string[] }[]
  // ) {
  //   const subscription = this.randomizerGroupListWithUsers$.subscribe( groupListWithUsers =>
  //     )
  //   await Promise.all(
  //     groupListWithUsers
  //       .filter( g => g.users.length === 0 )
  //       .map( g => this.database.randomizerGroup.removeGroup( g.group.databaseKey ) ) );
  // }

  private resetAddGroupForm() {
    this.newGroupName = '';
    this.newGroupPassword = '';
  }

  private resetSignInForm() {
    this.signInPassword = '';
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, undefined, { duration: 3000 });
  }
}
