import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { User as fbUser } from 'firebase/app';
import { combine, fromObservable, RN } from 'rnjs';
import { FireDatabaseService } from './database.service';
import { User } from './user';

@Injectable()
export class UserService {
  private uid: string = '';
  uid$: RN<string>;
  signedIn$: RN<boolean>;
  myDisplayName$: RN<string>;

  private user$: RN<User>;

  name$: RN<string>;
  nameYomi$: RN<string>;
  randomizerGroupId$: RN<string>;
  onlineGame: {
    isSelectedExpansions$: RN<boolean[]>;
    numberOfPlayers$: RN<number>;
    roomId$: RN<string>;
    communicationId$: RN<string>;
    chatOpened$: RN<boolean>;
    cardSizeAutoChange$: RN<boolean>;
    cardSizeRatio$: RN<number>;
    // messageSec$:           RN<number>,
    autoSort$: RN<boolean>;
  };

  signedInToRandomizerGroup$: RN<boolean>;

  constructor(
    private afAuth: AngularFireAuth,
    private database: FireDatabaseService,
  ) {
    this.signedIn$ = fromObservable<fbUser>(
      {} as fbUser,
      this.afAuth.authState,
    ).map((user) => !!user);

    this.uid$ = fromObservable<fbUser>({} as fbUser, this.afAuth.authState).map(
      (user) => (user || { uid: '' }).uid || '',
    );

    this.myDisplayName$ = fromObservable<fbUser>(
      {} as fbUser,
      this.afAuth.authState,
    ).map((user) => (user || { displayName: '' }).displayName || '');

    this.user$ = combine(this.uid$, this.database.users$).map(([uid, users]) =>
      !uid || users.length === 0
        ? new User()
        : users.find((e) => e.databaseKey === uid) || new User(),
    );

    this.name$ = this.user$.pluck('name').skipUnchanged();
    this.nameYomi$ = this.user$.pluck('nameYomi').skipUnchanged();
    this.randomizerGroupId$ = this.user$
      .pluck('randomizerGroupId')
      .skipUnchanged();

    const onlineGame$ = this.user$.pluck('onlineGame');

    this.onlineGame = {
      isSelectedExpansions$: combine(
        this.database.expansionNameList$.map((list) => list.map((_) => false)),
        onlineGame$.pluck('isSelectedExpansions').skipUnchanged(),
      ).map(([initArray, isSelectedExpansions]) =>
        initArray.map((_, i) => !!isSelectedExpansions[i]),
      ),

      numberOfPlayers$: onlineGame$.pluck('numberOfPlayers').skipUnchanged(),

      roomId$: onlineGame$.pluck('roomId').skipUnchanged(),

      communicationId$: onlineGame$.pluck('communicationId').skipUnchanged(),

      chatOpened$: onlineGame$.pluck('chatOpened').skipUnchanged(),

      cardSizeAutoChange$: onlineGame$
        .pluck('cardSizeAutoChange')
        .skipUnchanged(),

      cardSizeRatio$: onlineGame$.pluck('cardSizeRatio').skipUnchanged(),

      // messageSec$ :
      //   this.user$.pipe(
      //       map( e => e.onlineGame.messageSec ),
      //       distinctUntilChanged() ),

      autoSort$: onlineGame$.pluck('autoSort').skipUnchanged(),
    };

    this.signedInToRandomizerGroup$ = this.randomizerGroupId$.map(
      (groupId) => !!groupId,
    );

    this.uid$.subscribe((val) => (this.uid = val));
  }

  setMyName(value: string) {
    if (!this.uid) return Promise.resolve();
    return this.database.user.set.name(this.uid, value);
  }

  setRandomizerGroupId(value: string) {
    if (!this.uid) return Promise.resolve();
    return this.database.user.set.randomizerGroupId(this.uid, value);
  }

  setOnlineGameIsSelectedExpansions(index: number, value: boolean) {
    if (!this.uid) return Promise.resolve();
    return this.database.user.set.onlineGame.isSelectedExpansions(
      this.uid,
      index,
      value,
    );
  }

  setOnlineGameNumberOfPlayers(value: number) {
    if (!this.uid) return Promise.resolve();
    return this.database.user.set.onlineGame.numberOfPlayers(this.uid, value);
  }

  setOnlineGameRoomId(value: string) {
    if (!this.uid) return Promise.resolve();
    return this.database.user.set.onlineGame.roomId(this.uid, value);
  }

  setGameCommunicationId(value: string) {
    if (!this.uid) return Promise.resolve();
    return this.database.user.set.onlineGame.communicationId(this.uid, value);
  }

  setOnlineGameChatOpened(value: boolean) {
    if (!this.uid) return Promise.resolve();
    return this.database.user.set.onlineGame.chatOpened(this.uid, value);
  }
  setOnlineGameCardSizeAutoChange(value: boolean) {
    if (!this.uid) return Promise.resolve();
    return this.database.user.set.onlineGame.cardSizeAutoChange(
      this.uid,
      value,
    );
  }
  setOnlineGameCardSizeRatio(value: number) {
    if (!this.uid) return Promise.resolve();
    return this.database.user.set.onlineGame.cardSizeRatio(this.uid, value);
  }
  // setOnlineGameMessageSec( sec: number ) {
  //   if ( !this.uid ) return Promise.resolve();
  //   return this.database.user.set.onlineGame.messageSec( this.uid, sec );
  // }
  setOnlineGameAutoSort(value: boolean) {
    if (!this.uid) return Promise.resolve();
    return this.database.user.set.onlineGame.autoSort(this.uid, value);
  }
}
